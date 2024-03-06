import { ComponentPropsWithRef, ElementType, useState } from 'react';

import classNames from "classnames";

import styles from "./Accordion.module.scss";

// export default function Button<T extends ElementType = "button">({
//     active,
//     children,
//     className,
//     secondary,
//     as,
//     ...props
//   }: ButtonProps<T> & Omit<ComponentPropsWithRef<T>, keyof ButtonProps<T>>) {
//     const Component = as ?? "button";
  
//     return (
//       <Component
//         className={classNames(
//           styles.root,
//           {
//             [styles.active]: active,
//             [styles.secondary]: secondary,
//           },
//           className
//         )}
//         {...props}
//       >
//         {children}
//       </Component>
//     );
//   }
  