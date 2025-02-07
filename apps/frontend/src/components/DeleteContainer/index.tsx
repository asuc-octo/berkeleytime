import { ReactNode } from "react";

import styles from "./DeleteContainer.module.scss"
import { IconButton } from "@repo/theme";
import { Xmark } from "iconoir-react";

interface DeleteContainerProps {
    children: ReactNode;
    onClick: () => void;
}

export default function DeleteContainer ({
    children,
    onClick
} : DeleteContainerProps) {
    return <div className={styles.root}>
        { children }
        <IconButton className={styles.delete} onClick={onClick}>
            <Xmark/>
        </IconButton>
    </div>
}