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
  Icon,
  ...props
}: SwitchPrimitive.Root.Props & {
  title: string;
  description: string;
  id: string;
  Icon?: React.ForwardRefExoticComponent<
    React.SVGProps<SVGSVGElement> & {
      title?: string;
    }
  >;
}) {
  return (
    <FieldLabel htmlFor={id}>
      <Field orientation="responsive">
        <FieldContent>
          <FieldTitle className="font-display text-sm">
            {Icon && <Icon className="-mt-0.5" />}
            {title}
          </FieldTitle>
          <FieldDescription className="text-xs text-pretty sm:max-w-[30ch]">
            {description}
          </FieldDescription>
        </FieldContent>
        <Switch id={id} {...props} className={"ml-auto"} />
      </Field>
    </FieldLabel>
  );
}
