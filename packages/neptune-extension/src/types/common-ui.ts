export interface ToolbarButtonProps {
  compact?: boolean
  icon: string // maybe we should specify concrete strings of icons
  label: string
  title: string
  visible?: boolean
  onClick: () => void
}
