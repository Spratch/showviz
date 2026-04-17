import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Switch as SwitchPrimitive } from "@base-ui/react/switch";

export function SwitchChoiceCard({
  title,
  description,
  id,
  ...props
}: SwitchPrimitive.Root.Props & {
  title: string;
  description: string;
  id: string;
}) {
  return (
    <FieldLabel htmlFor={id} className="sm:max-w-[40ch]">
      <Field orientation="horizontal">
        <FieldContent>
          <FieldTitle className="font-display text-sm">{title}</FieldTitle>
          <FieldDescription className="max-w-[30ch] text-xs text-pretty">
            {description}
          </FieldDescription>
        </FieldContent>
        <Switch id={id} {...props} />
      </Field>
    </FieldLabel>
  );
}
