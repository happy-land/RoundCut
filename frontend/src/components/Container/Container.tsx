import { FC, ReactNode } from "react";
import { block } from "bem-cn";
import "./Container.scss";

const cnStyles = block("Container");

interface ContainerProps {
  children: ReactNode;
}

const Container: FC<ContainerProps> = ({ children }) => {
  return <div className={cnStyles()}>{children}</div>;
};

export default Container;
