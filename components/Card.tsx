import { ElementType, ReactNode, MouseEventHandler } from 'react';

type Padding = 'none' | 'sm' | 'md' | 'lg';
type Tone = 'default' | 'subtle' | 'elevated';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  hover?: boolean;
  padding?: Padding;
  tone?: Tone;
  as?: ElementType;
}

const paddingClass: Record<Padding, string> = {
  none: '',
  sm: 'card-padding-sm',
  md: 'card-padding-md',
  lg: 'card-padding-lg',
};

const toneClass: Record<Tone, string> = {
  default: '',
  subtle: 'card-tone-subtle',
  elevated: 'card-tone-elevated',
};

export default function Card({
  children,
  className = '',
  onClick,
  hover = false,
  padding = 'md',
  tone = 'default',
  as: Tag = 'div',
}: CardProps) {
  const interactive = !!onClick || hover;
  return (
    <Tag
      onClick={onClick}
      className={`card ${paddingClass[padding]} ${toneClass[tone]} ${
        interactive ? 'transition-shadow hover:shadow-sm cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </Tag>
  );
}
