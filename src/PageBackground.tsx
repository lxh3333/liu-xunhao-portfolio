import PageGrainient from "./PageGrainient";
import "./PageBackground.css";

export default function PageBackground({ continuous = false }: { continuous?: boolean }) {
  return (
    <div className={`page-background${continuous ? " page-background--continuous" : ""}`} aria-hidden="true">
      <PageGrainient
        className="page-background-canvas"
        color1="#71513C"
        color2="#344C43"
        color3="#101212"
        timeSpeed={0.14}
        contrast={1}
        saturation={0.8}
        grainAmount={0.035}
        grainScale={2.7}
        blendSoftness={0.18}
        warpStrength={0.8}
        rotationAmount={180}
      />
    </div>
  );
}
