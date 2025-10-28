import { useCallback, useMemo, useState } from "react";
import { SessionMode } from "@/shared/lib/session";
import { useLocation } from "@/shared/hooks/useLocation";
import { updateQuery } from "@/shared/lib/query";
import { isEmpty, isNil } from "lodash";
import { ToolsetBrowser } from "@/shared/components/tools/ToolsetBrowser";
import { CreateToolsetModal } from "@/shared/components/tools/CreateToolsetModal";
import { ToolLoader, Toolset } from "@/shared/lib/datastore";
import { ConfigureSessionForm } from "./ConfigureSessionForm";

type Modals = "tools" | "new-toolset";

const validModal = (
  modalParam: string | undefined | null
): modalParam is Modals => {
  return modalParam === "tools" || modalParam === "new-toolset";
};

export function ConfigureSession() {
  const [taskDescription, setTaskDescription] = useState("");
  const [tools, setTools] = useState<string[]>([""]);
  const [duration, setDuration] = useState<number | "not-selected">(
    "not-selected"
  );
  const { search } = useLocation();
  const {
    sessionMode,
    modalView,
  }: {
    sessionMode: SessionMode;
    modalView?: "tools" | "new-toolset" | undefined;
  } = useMemo(() => {
    const params = new URLSearchParams(search);
    const sessionMode =
      params.get("sessionMode") === "free" ? "free" : "standard";
    const modalParam = params.get("modal");
    const modalView = validModal(modalParam) ? modalParam : undefined;

    return { sessionMode, modalView };
  }, [search]);
  const showForm = isEmpty(modalView);
  const showToolBrowser = modalView === "tools";
  const showSaveAsToolset = modalView === "new-toolset";

  const handleChangeTab = useCallback((tabId: string) => {
    if (tabId === "free") {
      updateQuery({ sessionMode: "free" });
    } else {
      updateQuery({ sessionMode: "standard" });
    }
  }, []);

  const closeModal = useCallback(() => {
    updateQuery({ modal: undefined });
  }, []);

  const handleSelectToolset = useCallback(
    async (toolset: Toolset) => {
      const loader = new ToolLoader();
      const tools = await Promise.all(
        toolset.toolIds.map(async (id) => await loader.get(id))
      );
      setTools(tools.filter((tool) => !isNil(tool)).map((tool) => tool.url));
    },
    [setTools]
  );

  return (
    <div className="flex flex-col gap-y-2">
      {showForm && (
        <ConfigureSessionForm
          sessionMode={sessionMode}
          taskDescription={taskDescription}
          tools={tools}
          duration={duration}
          onChangeTaskDescription={setTaskDescription}
          onSetTools={setTools}
          onSetDuration={setDuration}
          onSelectTab={handleChangeTab}
        />
      )}
      {showToolBrowser && (
        <ToolsetBrowser
          onBack={closeModal}
          onSelectToolset={handleSelectToolset}
        />
      )}
      {showSaveAsToolset && (
        <CreateToolsetModal
          tools={tools}
          onBack={closeModal}
          onUpdateTools={setTools}
        />
      )}
    </div>
  );
}
