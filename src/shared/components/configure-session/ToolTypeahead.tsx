import React, { useCallback, useEffect, useMemo, useState } from "react";
import { DataLoader, ToolDefinition } from "../../lib/datastore";
import CreatableSelect from "react-select/creatable";
import { isEmpty } from "lodash";
import clsx from "clsx";
import { isValidToolUrl } from "@/shared/lib/tool";

type CreatableProps = React.ComponentProps<typeof CreatableSelect>;

interface Props
  extends Pick<
    CreatableProps,
    "onBlur" | "onFocus" | "classNames" | "defaultValue" | "styles"
  > {
  onSelect: ({ url }: Pick<ToolDefinition, "url">) => void;
  value: string;
}

export function ToolTypeahead({ onSelect, value, ...rest }: Props) {
  const [definitions, setDefinitions] = useState<ToolDefinition[]>([]);
  const [created, setCreated] = useState<Pick<ToolDefinition, "url">[]>([]);
  useEffect(() => {
    new DataLoader().allToolDefinitions().then(setDefinitions);
  }, []);

  const handleCreate = useCallback(
    (url: string) => {
      setCreated((rest) => [...rest, { url }]);
      onSelect({ url });
    },
    [onSelect, setCreated]
  );

  const options = useMemo(
    () => [...definitions, ...created],
    [created, definitions]
  );

  const selectedOption = useMemo(() => {
    if (isEmpty(value)) return;
    return options.find(({ url }) => url === value);
  }, [options, created]);

  useEffect(() => {
    console.log({
      options,
      created,
      definitions,
      value,
      selectedOption,
    });
  }, [options, created, definitions, value, selectedOption]);

  return (
    <CreatableSelect
      onChange={(def) => {
        onSelect(def as ToolDefinition);
      }}
      isValidNewOption={isValidToolUrl}
      value={value ? { url: value } : undefined}
      onCreateOption={handleCreate}
      classNames={{
        container: () => "w-full",
        control: () => "rounded-0 select w-full border-[0.5px] px-3",
        menu: () => "rounded-0 border-[0.5px] bg-base-300 z-90",
        option: ({ isFocused, isSelected }) =>
          clsx("px-3 py-2 text-primary z-90", {
            "bg-base-200": isFocused || isSelected,
          }),

        dropdownIndicator: () => "hidden",
      }}
      isClearable
      unstyled
      options={options}
      getNewOptionData={(url) => ({ url })}
      getOptionValue={(o) => (o as ToolDefinition)?.url}
      getOptionLabel={(o) => (o as ToolDefinition)?.url}
      {...rest}
    />
  );
}
