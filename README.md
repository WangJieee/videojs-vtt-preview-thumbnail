# videojs-vtt-preview-thumbnail

A Video.js plugin for displaying preview thumbnails over progress bar. Compatible with video.js v8.

## Getting Started

### Installation

```
npm install videojs-vtt-preview-thumbnail
```

### Usage

Import the library, initialise a videojs player and add the plugin

```
import videojs from 'video.js'
import 'videojs-vtt-preview-thumbnail'

const player = videojs('video');

player.vttPreviewThumbnail({
  vttSrc: 'path/to/thumbnails.vtt',
});
```

## Options

| Option | Description                                                                                     |
| ------ | ----------------------------------------------------------------------------------------------- |
| vttSrc | url/path to the .vtt file containing thumbnail image of format `image.jpg#xywh={x},{y},{w},{h}` |
