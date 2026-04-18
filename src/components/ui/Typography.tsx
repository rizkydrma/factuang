import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const typographyVariants = cva('', {
  variants: {
    variant: {
      h1: 'text-[2.618rem] leading-[1.2] font-bold tracking-tight',
      h2: 'text-[1.618rem] leading-[1.3] font-bold tracking-tight',
      h3: 'text-[1.272rem] leading-[1.4] font-semibold tracking-tight',
      h4: 'text-[1.15rem] leading-[1.5] font-semibold',
      p: 'text-[1rem] leading-[1.6] font-normal',
      small: 'text-[0.786rem] leading-[1.6] font-medium',
      xs: 'text-[0.618rem] leading-[1.6] font-medium tracking-wide uppercase',
    },
    weight: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    },
    mono: {
      true: 'font-mono tabular-nums tracking-tight',
      false: 'font-sans',
    },
    muted: {
      true: 'text-muted-foreground',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'p',
    weight: 'normal',
    mono: false,
    muted: false,
  },
});

interface TypographyProps
  extends
    React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  as?: React.ElementType;
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant, weight, mono, muted, as, ...props }, ref) => {
    // Determine the tag based on variant if 'as' is not provided
    const Tag =
      as || (variant?.startsWith('h') ? (variant as React.ElementType) : 'p');

    return (
      <Tag
        ref={ref}
        className={cn(
          typographyVariants({ variant, weight, mono, muted, className }),
        )}
        {...props}
      />
    );
  },
);

Typography.displayName = 'Typography';

export { Typography };
