"use client";

import * as React from "react";
import * as AccordionPrime from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "lucide-react";
import { motion, AnimatePresence, type HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";

type AccordionProps = React.ComponentProps<typeof AccordionPrime.Root>;

export function Accordion(props: AccordionProps) {
  return <AccordionPrimitive {...props} />;
}

type AccordionItemProps = React.ComponentProps<typeof AccordionPrime.Item>;

export function AccordionItem({ className, ...props }: AccordionItemProps) {
  return (
    <AccordionItemPrimitive
      className={cn("border-b last:border-b-0", className)}
      {...props}
    />
  );
}

type AccordionTriggerProps = React.ComponentProps<typeof AccordionPrime.Trigger> & {
  showArrow?: boolean;
};

export function AccordionTrigger({
  className,
  children,
  showArrow = true,
  ...props
}: AccordionTriggerProps) {
  return (
    <AccordionHeaderPrimitive className="flex">
      <AccordionTriggerPrimitive
        className={cn(
          "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
          className
        )}
        {...props}
      >
        {children}
        {showArrow && (
          <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />
        )}
      </AccordionTriggerPrimitive>
    </AccordionHeaderPrimitive>
  );
}

type AccordionContentProps = Omit<React.ComponentProps<typeof AccordionPrime.Content>, "asChild" | "forceMount"> & {
  className?: string;
  children: React.ReactNode;
};

export function AccordionContent({
  className,
  children,
  ...props
}: AccordionContentProps) {
  return (
    <AccordionContentPrimitive {...props}>
      <div className={cn("text-sm pt-0 pb-4", className)}>{children}</div>
    </AccordionContentPrimitive>
  );
}

// Animated primitives with Framer Motion
type AccordionContextType = {
  value: string | string[] | undefined;
  setValue: (value: string | string[] | undefined) => void;
};

type AccordionItemContextType = {
  value: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

const [AccordionProvider, useAccordion] =
  getStrictContext<AccordionContextType>("AccordionContext");

const [AccordionItemProvider, useAccordionItem] =
  getStrictContext<AccordionItemContextType>("AccordionItemContext");

type AccordionPrimitiveProps = React.ComponentProps<typeof AccordionPrime.Root>;

function AccordionPrimitive(props: AccordionPrimitiveProps) {
  const [value, setValue] = useControlledState<string | string[] | undefined>({
    value: props?.value,
    defaultValue: props?.defaultValue,
    onChange: props?.onValueChange as (
      value: string | string[] | undefined
    ) => void,
  });

  return (
    <AccordionProvider value={{ value, setValue }}>
      <AccordionPrime.Root
        data-slot="accordion"
        {...props}
        onValueChange={setValue}
      />
    </AccordionProvider>
  );
}

type AccordionItemPrimitiveProps = React.ComponentProps<typeof AccordionPrime.Item>;

function AccordionItemPrimitive(props: AccordionItemPrimitiveProps) {
  const { value } = useAccordion();
  const [isOpen, setIsOpen] = React.useState(
    value?.includes(props?.value) ?? false
  );

  React.useEffect(() => {
    setIsOpen(value?.includes(props?.value) ?? false);
  }, [value, props?.value]);

  return (
    <AccordionItemProvider value={{ isOpen, setIsOpen, value: props.value }}>
      <AccordionPrime.Item data-slot="accordion-item" {...props} />
    </AccordionItemProvider>
  );
}

type AccordionHeaderPrimitiveProps = React.ComponentProps<
  typeof AccordionPrime.Header
>;

function AccordionHeaderPrimitive(props: AccordionHeaderPrimitiveProps) {
  return <AccordionPrime.Header data-slot="accordion-header" {...props} />;
}

type AccordionTriggerPrimitiveProps = React.ComponentProps<
  typeof AccordionPrime.Trigger
>;

function AccordionTriggerPrimitive(props: AccordionTriggerPrimitiveProps) {
  return (
    <AccordionPrime.Trigger data-slot="accordion-trigger" {...props} />
  );
}

import type { Transition } from "motion/react";

type AccordionContentPrimitiveProps = {
  keepRendered?: boolean;
  transition?: Transition;
  className?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
};

function AccordionContentPrimitive({
  keepRendered = false,
  transition = { duration: 0.35, ease: "easeInOut" },
  className,
  children,
  style,
  ...restProps
}: AccordionContentPrimitiveProps) {
  const { isOpen } = useAccordionItem();

  return (
    <AnimatePresence>
      {keepRendered ? (
        <AccordionPrime.Content asChild forceMount>
          <motion.div
            key="accordion-content"
            data-slot="accordion-content"
            initial={{ height: 0, opacity: 0, "--mask-stop": "0%", y: 20 }}
            animate={
              isOpen
                ? { height: "auto", opacity: 1, "--mask-stop": "100%", y: 0 }
                : { height: 0, opacity: 0, "--mask-stop": "0%", y: 20 }
            }
            transition={transition}
            style={{
              maskImage:
                "linear-gradient(black var(--mask-stop), transparent var(--mask-stop))",
              WebkitMaskImage:
                "linear-gradient(black var(--mask-stop), transparent var(--mask-stop))",
              overflow: "hidden",
              ...style,
            }}
            className={className}
            {...restProps}
          />
        </AccordionPrime.Content>
      ) : (
        isOpen && (
          <AccordionPrime.Content asChild forceMount>
            <motion.div
              key="accordion-content"
              data-slot="accordion-content"
              initial={{ height: 0, opacity: 0, "--mask-stop": "0%", y: 20 }}
              animate={{
                height: "auto",
                opacity: 1,
                "--mask-stop": "100%",
                y: 0,
              }}
              exit={{ height: 0, opacity: 0, "--mask-stop": "0%", y: 20 }}
              transition={transition}
              style={{
                maskImage:
                  "linear-gradient(black var(--mask-stop), transparent var(--mask-stop))",
                WebkitMaskImage:
                  "linear-gradient(black var(--mask-stop), transparent var(--mask-stop))",
                overflow: "hidden",
                ...style,
              }}
              className={className}
              {...restProps}
            />
          </AccordionPrime.Content>
        )
      )}
    </AnimatePresence>
  );
}

// Context helpers
function getStrictContext<T>(
  name?: string
): readonly [
  ({
    value,
    children,
  }: {
    value: T;
    children?: React.ReactNode;
  }) => React.JSX.Element,
  () => T
] {
  const Context = React.createContext<T | undefined>(undefined);

  const Provider = ({
    value,
    children,
  }: {
    value: T;
    children?: React.ReactNode;
  }) => <Context.Provider value={value}>{children}</Context.Provider>;

  const useSafeContext = () => {
    const ctx = React.useContext(Context);
    if (ctx === undefined) {
      throw new Error(`useContext must be used within ${name ?? "a Provider"}`);
    }
    return ctx;
  };

  return [Provider, useSafeContext] as const;
}

interface CommonControlledStateProps<T> {
  value?: T;
  defaultValue?: T;
}

export function useControlledState<T, Rest extends any[] = []>(
  props: CommonControlledStateProps<T> & {
    onChange?: (value: T, ...args: Rest) => void;
  }
): readonly [T, (next: T, ...args: Rest) => void] {
  const { value, defaultValue, onChange } = props;

  const [state, setInternalState] = React.useState<T>(
    value !== undefined ? value : (defaultValue as T)
  );

  React.useEffect(() => {
    if (value !== undefined) setInternalState(value);
  }, [value]);

  const setState = React.useCallback(
    (next: T, ...args: Rest) => {
      setInternalState(next);
      onChange?.(next, ...args);
    },
    [onChange]
  );

  return [state, setState] as const;
}