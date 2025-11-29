import { TFunction } from "i18next";
import { isEmpty, uniq } from "lodash";
import { validateTools } from "./tool";

type DescriptionValidation = { invalidReason?: string; isValid: boolean };

const validateTaskDescription = (
  description: string,
  minWords: number,
  minChars: number,
  t: TFunction
): DescriptionValidation => {
  let invalidReason: string | undefined;
  if (description == null || description.length < minChars) {
    // invalidReason = `Say a little bit more.`;
    invalidReason = t("configureSession.promptToShort");
  } else if (description.split(" ").length < minWords) {
    // invalidReason = `Express yourself - use at least ${minWords} words.`;
    invalidReason = t("configureSession.promptNotEnoughWords", {
      wordcount: minWords,
    });
  } else if (uniq(description.split("")).length < 3) {
    // invalidReason = `This description doesn't look quite right. Try again.`;
    invalidReason = t("configureSession.promptNotComplexEnough");
  }

  return {
    invalidReason,
    isValid: invalidReason == null,
  };
};

interface ValidatorArgs {
  taskDescription: string;
  tools: string[];
  duration: number | "not-selected";
  sessionMode: "free" | "standard";
}

export interface FormValidationState {
  tools: { empty: boolean; allValid: boolean };
  description: DescriptionValidation;
  isFormValid: boolean;
}

export const validateFormState = (
  { taskDescription, tools, duration, sessionMode }: ValidatorArgs,
  t: TFunction
): FormValidationState => {
  const descriptionValidation = validateTaskDescription(
    taskDescription,
    3,
    12,
    t
  );

  if (sessionMode === "free") {
    return {
      tools: { empty: true, allValid: true },
      isFormValid:
        descriptionValidation.isValid && typeof duration === "number",
      description: descriptionValidation,
    };
  }

  const toolValidation = validateTools(tools);

  const isFormValid =
    toolValidation.allValid &&
    !toolValidation.empty &&
    duration !== "not-selected" &&
    !isEmpty(taskDescription);

  return {
    tools: toolValidation,
    isFormValid,
    description: descriptionValidation,
  };
};
