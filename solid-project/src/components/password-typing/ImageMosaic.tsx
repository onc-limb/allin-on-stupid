import type { Accessor } from "solid-js";
import { getMosaicFilter } from "./utils";
import "./ImageMosaic.css";

type ImageMosaicProps = {
  imageSrc: Accessor<string>;
  mosaicLevel: Accessor<number>;
};

export default function ImageMosaic(props: ImageMosaicProps) {
  return (
    <div class="image-container">
      <img 
        src={props.imageSrc()} 
        alt="問題画像" 
        class="puzzle-image"
        style={{
          filter: getMosaicFilter(props.mosaicLevel()),
          transition: "filter 0.3s ease"
        }}
      />
      <div class="mosaic-info">
        <div class="mosaic-bar">
          <div 
            class="mosaic-bar-fill" 
            style={{ width: `${100 - props.mosaicLevel()}%` }}
          />
        </div>
        <div class="mosaic-text">
          モザイク解除: {Math.round(100 - props.mosaicLevel())}%
        </div>
      </div>
    </div>
  );
}
