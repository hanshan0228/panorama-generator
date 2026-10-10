/**
 * Client-Side Google PhotoSphere XMP Metadata Injector
 * Embeds standard GPano XMP tags into JPEG files so they are natively recognized
 * by Facebook, Google Photos, Apple Vision Pro, Meta Quest, and 360° VR viewers.
 */

export function buildPhotoSphereXmpXml(width: number, height: number): string {
  return `<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Adobe XMP Core 5.1.0-jc003">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description xmlns:GPano="http://ns.google.com/photos/1.0/panorama/" rdf:about="">
      <GPano:UsePanoramaViewer>True</GPano:UsePanoramaViewer>
      <GPano:CaptureSoftware>PanoramaAI Studio</GPano:CaptureSoftware>
      <GPano:StitchingSoftware>PanoramaAI 360 VR Pipeline</GPano:StitchingSoftware>
      <GPano:ProjectionType>equirectangular</GPano:ProjectionType>
      <GPano:PoseHeadingDegrees>0.0</GPano:PoseHeadingDegrees>
      <GPano:PosePitchDegrees>0.0</GPano:PosePitchDegrees>
      <GPano:PoseRollDegrees>0.0</GPano:PoseRollDegrees>
      <GPano:InitialViewHeadingDegrees>0</GPano:InitialViewHeadingDegrees>
      <GPano:InitialViewPitchDegrees>0</GPano:InitialViewPitchDegrees>
      <GPano:InitialHorizontalFOVDegrees>75.0</GPano:InitialHorizontalFOVDegrees>
      <GPano:CroppedAreaImageWidthPixels>${width}</GPano:CroppedAreaImageWidthPixels>
      <GPano:CroppedAreaImageHeightPixels>${height}</GPano:CroppedAreaImageHeightPixels>
      <GPano:FullPanoWidthPixels>${width}</GPano:FullPanoWidthPixels>
      <GPano:FullPanoHeightPixels>${height}</GPano:FullPanoHeightPixels>
      <GPano:CroppedAreaLeftPixels>0</GPano:CroppedAreaLeftPixels>
      <GPano:CroppedAreaTopPixels>0</GPano:CroppedAreaTopPixels>
      <GPano:SourcePhotosCount>1</GPano:SourcePhotosCount>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>`;
}

/**
 * Injects Google PhotoSphere XMP APP1 packet into a JPEG ArrayBuffer
 */
export function injectPhotoSphereXmp(jpegBuffer: ArrayBuffer, width: number, height: number): Blob {
  const bytes = new Uint8Array(jpegBuffer);

  // Validate JPEG SOI marker (0xFF, 0xD8)
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    return new Blob([jpegBuffer], { type: 'image/jpeg' });
  }

  const xmpXml = buildPhotoSphereXmpXml(width, height);
  const xmpHeader = 'http://ns.adobe.com/xap/1.0/\0';
  const encoder = new TextEncoder();
  const xmpHeaderBytes = encoder.encode(xmpHeader);
  const xmpXmlBytes = encoder.encode(xmpXml);

  // APP1 payload: identifier (29 bytes) + XMP XML
  const payloadLength = xmpHeaderBytes.length + xmpXmlBytes.length;
  const markerLength = payloadLength + 2; // includes the 2-byte length field

  if (markerLength > 65535) {
    // Falls beyond single segment limit, return uncompressed
    return new Blob([jpegBuffer], { type: 'image/jpeg' });
  }

  // Construct APP1 segment
  const app1Segment = new Uint8Array(4 + payloadLength);
  app1Segment[0] = 0xff;
  app1Segment[1] = 0xe1;
  app1Segment[2] = (markerLength >> 8) & 0xff;
  app1Segment[3] = markerLength & 0xff;
  app1Segment.set(xmpHeaderBytes, 4);
  app1Segment.set(xmpXmlBytes, 4 + xmpHeaderBytes.length);

  // Find insertion point: directly after SOI (0xFF 0xD8), or after existing APP0 (JFIF)
  let insertIndex = 2;
  if (bytes[2] === 0xff && bytes[3] === 0xe0) {
    const app0Length = (bytes[4] << 8) | bytes[5];
    insertIndex = 4 + app0Length;
  }

  // Combine into single output array
  const outputLength = bytes.length + app1Segment.length;
  const output = new Uint8Array(outputLength);

  output.set(bytes.subarray(0, insertIndex), 0);
  output.set(app1Segment, insertIndex);
  output.set(bytes.subarray(insertIndex), insertIndex + app1Segment.length);

  return new Blob([output], { type: 'image/jpeg' });
}

/**
 * Converts a 2:1 canvas to a VR-ready JPEG Blob with embedded Google PhotoSphere XMP metadata
 */
export async function exportVrReadyJpegBlob(canvas: HTMLCanvasElement, quality = 0.95): Promise<Blob> {
  return new Promise((resolve) => {
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          resolve(new Blob([], { type: 'image/jpeg' }));
          return;
        }
        const buffer = await blob.arrayBuffer();
        const vrBlob = injectPhotoSphereXmp(buffer, canvas.width, canvas.height);
        resolve(vrBlob);
      },
      'image/jpeg',
      quality
    );
  });
}
