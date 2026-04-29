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
      <Field orientation="horizontal">
        <FieldContent>
          <FieldTitle className="font-display text-xs sm:text-sm">
            {Icon && <Icon className="-mt-0.5 max-sm:hidden" />}
            {title}
          </FieldTitle>
          <FieldDescription className="text-2xs/tight max-w-[30ch] text-pretty sm:text-xs">
            {description}
          </FieldDescription>
        </FieldContent>
        <Switch id={id} {...props} className={"ml-auto"} />
      </Field>
    </FieldLabel>
  );
}
