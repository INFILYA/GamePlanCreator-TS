import { TSectionWrapper } from "../types/types";

export default function SectionWrapper(props: TSectionWrapper) {
  const { className, backGround, children } = props;
  return (
    <section className={className}>
      <div className="section-border">
        <div className="section-background">{backGround}</div>
      </div>
      <div className="section-content-wrapper">
        <div className="section-content">{children}</div>
      </div>
    </section>
  );
}
