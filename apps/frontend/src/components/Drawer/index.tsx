import { ReactNode } from "react";

import styles from "./Drawer.module.scss";
import { Dialog } from "@repo/theme";
import classNames from "classnames";

interface Props {
  onOpenChange?: (open: boolean) => void;
  width?: number;
}

interface ControlledProps extends Props {
  open?: boolean;
  changeOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  content: ReactNode;
  children: ReactNode;
}

interface UncontrolledProps extends Props {
  open: boolean;
  changeOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  content: ReactNode;
  children?: never;
}

export type DrawerProps = ControlledProps | UncontrolledProps;

type BaseDrawerProps = DrawerProps & {left: boolean}

function BaseDrawer({
    children,
    open,
    changeOpen,
    onOpenChange,
    left,
    content,
    ...props
  }: BaseDrawerProps) {
    return (
      <Dialog.Root onOpenChange={onOpenChange} open={open}>
        <Dialog.Title style={{display: "none"}}/>
        {children && (
          <Dialog.Trigger {...props} asChild>
            { children }
          </Dialog.Trigger>
        )}
        <Dialog.Content className={classNames([styles.content, (left) ? styles.left : styles.right])} onPointerDownOutside={ (open && changeOpen) ? () => {changeOpen(false)} : () => {}}>
            { content }
        </Dialog.Content>
      </Dialog.Root>
    );
  }

const Left = (props: DrawerProps) => BaseDrawer({...props, left: true})
const Right = (props: DrawerProps) => BaseDrawer({...props, left: false})

const Drawer = {
    Left,
    Right
};
  
  export default Drawer;
  