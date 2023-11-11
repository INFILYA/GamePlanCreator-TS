import { TSectionWrapper } from "../types/types";

export default function SectionWrapper(props: TSectionWrapper) {
  const { className, backGround, content } = props;
  return (
    <section className={className}>
      <div className="section-border">
        <div className="section-background">{backGround}</div>
      </div>
      <div className="section-content-wrapper">
        <div className="section-content">{content}</div>
      </div>
    </section>
  );
}
