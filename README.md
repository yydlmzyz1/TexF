# TexF

## Beyond UV Mapping: Mesh Texture Compression via Surface-Aligned Texture Fields

Jianqiang Wang, Junhui Hou, Siyu Ren, Weiyao Lin, Wenping Wang

City University of Hong Kong · Shanghai Jiao Tong University · Texas A&M University

<div class="project-links" align="center">
  <a href="https://yydlmzyz1.github.io/TexF/">Project Page</a> &nbsp;·&nbsp;
  <a href="https://arxiv.org/abs/2609.23606">Paper (arXiv)</a> &nbsp;·&nbsp;
  <a href="https://arxiv.org/pdf/2609.23606">PDF</a>
</div>

TexF uses the mesh surface itself to organize and access texture in 3D, rather than mapping it to a separate 2D UV atlas. It supports both compact bitstreams for transmission and GPU-resident compression for real-time rendering.

<p align="center">
  <a href="assets/overview.png"><img src="assets/overview.png" width="480" alt="Overview of UV-based and surface-aligned TexF texture compression"></a>
</p>

## Overview

![TexF construction, refinement, and two compression modes](assets/pipeline.png)

TexF is a surface-aligned texture field that organizes texture attributes in sparse voxels derived from the mesh surface. It supports high-resolution textures while preserving local 3D correlations for compression and enabling direct surface queries. Differentiable rendering enables image-space refinement of both voxel attributes and compressed neural fields.

We explore two complementary compression modes:

- **Bitstream compression:** established 3D attribute codecs, including Unicorn and G-PCC, compress TexF attributes. The decoder derives voxel locations from the mesh, avoiding their separate transmission.
- **GPU-resident compression:** 3DNTC combines quantized hash features with a lightweight neural decoder to reconstruct texture on demand during rendering.

## Selected Results

Experiments on the MPEG and AOM benchmarks show improved average rate-distortion performance over representative UV-based methods in both compression settings.

### Bitstream Compression

![Bitstream compression: MPEG PSNR, MPEG SSIM, AOM PSNR, and AOM SSIM](assets/bitstream-rd.png)

Average PSNR and SSIM versus bitstream size on MPEG (first two panels) and AOM (last two).

![Bitstream compression comparison on Promo Ashtray](assets/bitstream-comparison.png)

Texture reconstruction at the indicated bitstream sizes. TexF preserves fine details using 3D attribute coding.

### GPU-Resident Compression

![GPU-resident compression: MPEG PSNR, MPEG SSIM, AOM PSNR, and AOM SSIM](assets/memory-rd.png)

Average PSNR and SSIM versus GPU memory size on MPEG (first two panels) and AOM (last two). Horizontal scales differ across the axis breaks.

![GPU-resident texture compression comparison on Police Station](assets/memory-comparison.png)

Texture reconstruction at the indicated GPU memory footprints. TexF/3DNTC combines compact memory use with random-access decoding.

## Interactive Comparison

### Bitstream Compression

<p class="demo-gallery" align="center">
  <a class="interactive-preview" href="https://yydlmzyz1.github.io/TexF/demo/?asset=promo-ashtray"><img src="assets/promo-ashtray-preview.jpg" width="300" alt="Promo Ashtray: click to rotate and zoom.">Promo Ashtray</a>
  <a class="interactive-preview" href="https://yydlmzyz1.github.io/TexF/demo/?asset=basket"><img src="assets/basket-preview.jpg" width="300" alt="Basket: click to rotate and zoom.">Basket</a>
  <a class="interactive-preview" href="https://yydlmzyz1.github.io/TexF/demo/?asset=police-station"><img src="assets/police-station-preview.jpg" width="300" alt="Police Station: click to rotate and zoom.">Police Station</a>
  <a class="interactive-preview" href="https://yydlmzyz1.github.io/TexF/demo/?asset=hussar"><img src="assets/hussar-preview.jpg" width="300" alt="Hussar: click to rotate and zoom.">Hussar</a>
</p>

Choose a model to rotate; select an HD detail from the View menu to compare close-ups.

### GPU-Resident Compression

<p class="demo-gallery memory-gallery" align="center">
  <a class="interactive-preview" href="https://yydlmzyz1.github.io/TexF/demo/?asset=memory-wooden-gramophone"><img src="assets/memory-wooden-gramophone-preview.jpg" width="300" alt="Wooden Gramophone GPU-resident compression: rotate and zoom.">Wooden Gramophone</a>
  <a class="interactive-preview" href="https://yydlmzyz1.github.io/TexF/demo/?asset=memory-police-station"><img src="assets/memory-police-station-preview.jpg" width="300" alt="Police Station GPU-resident compression: rotate and zoom.">Police Station</a>
  <a class="interactive-preview" href="https://yydlmzyz1.github.io/TexF/demo/?asset=memory-butterflies-collection"><img src="assets/memory-butterflies-collection-preview.jpg" width="300" alt="Butterflies Collection GPU-resident compression: rotate and zoom.">Butterflies Collection</a>
  <a class="interactive-preview" href="https://yydlmzyz1.github.io/TexF/demo/?asset=memory-grey-knight"><img src="assets/memory-grey-knight-preview.jpg" width="300" alt="Grey Knight GPU-resident compression: rotate and zoom.">Grey Knight</a>
</p>

## Updates

- **2026-09-20:** The [preprint](https://arxiv.org/abs/2609.23606) is available on arXiv.

Code will be released.

For questions, contact [wang.jq@cityu.edu.hk](mailto:wang.jq@cityu.edu.hk).

## Citation

```bibtex
@misc{wang2026texf,
  title         = {Beyond {UV} Mapping: Mesh Texture Compression via Surface-Aligned Texture Fields},
  author        = {Jianqiang Wang and Junhui Hou and Siyu Ren and Weiyao Lin and Wenping Wang},
  year          = {2026},
  eprint        = {2609.23606},
  archivePrefix = {arXiv},
  url           = {https://arxiv.org/abs/2609.23606}
}
```
