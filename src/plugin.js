import videojs from 'video.js'
import packageInfo from '../package.json'
import './plugin.css'

const Plugin = videojs.getPlugin('plugin')

class VttPreviewThumbnail extends Plugin {
  constructor(player, options) {
    super(player, options);

    if (options.vttSrc) {
      this.vttSrc = options.vttSrc
      this.getVttData()
      this.createThumbnailPreview()
    } else {
      console.error('No source file exists!')
    }

  }

  getVttData() {
    fetch(this.vttSrc)
      .then(response => response.text())
      .then(data => {
        this.vttData = this.processVttPayload(data)
      })
      .catch(error => {
        console.error('Error fetching VTT file:', error);
      });
  }

  processVttPayload(data) {
    const cues = []
    const lines = data.split('\n')
    let i = 0

    while (i < lines.length) {
      const line = lines[i].trim()

      if (line && !line.startsWith('WEBVTT')) {
        const timeMatch = line.match(/(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})/)
        if (timeMatch) {
          const start = this.getSecondsFromTimestamp(timeMatch[1])
          const end = this.getSecondsFromTimestamp(timeMatch[2])
          i++
          const imageUrl = lines[i].trim()
          const matchXYWH = imageUrl.match(/#xywh=(\d+),(\d+),(\d+),(\d+)/);
          if (matchXYWH) {
            const [, x, y, width, height] = matchXYWH
            const css = {
              backgroundImage: `url(${imageUrl.split('#')[0]})`,
              backgroundPosition:`-${x}px -${y}px`,
              width: `${width}px`,
              height: `${height}px`
            }
            cues.push({ start, end, css })
          }
        } else {
          console.error('malformated time code: ', line)
        }
      }
      i++
    }
    return cues
  }

  createThumbnailPreview() {
    this.thumbHolder = document.createElement('div')
    this.thumbHolder.setAttribute('class', 'vjs-vtt-thumbnail-holder')
    this.timestampLabel = document.createElement('div')
    this.timestampLabel.setAttribute('class', 'vjs-vtt-thumbnail-timestamp')
    this.thumbHolder.appendChild(this.timestampLabel)
    this.progressBar = this.player.controlBar.progressControl.el()
    this.progressBar.appendChild(this.thumbHolder)
    // hide default time tooltip
    this.player.controlBar.progressControl.seekBar.mouseTimeDisplay.addClass('vjs-hidden')

    this.progressBar.addEventListener('mouseenter', this.onProgressBarMouseEnter)
    this.progressBar.addEventListener('mouseleave', this.onProgressBarMouseLeave)
  }

  onProgressBarMouseEnter = () => {
    this.progressBar.addEventListener('mousemove', this.onProgressBarMouseMove)
    this.showThumbnailHolder()
  }

  onProgressBarMouseLeave = () => {
    this.progressBar.removeEventListener('mousemove', this.onProgressBarMouseMove)
    this.hideThumbnailHolder()
  }

  onProgressBarMouseMove = (event) => {
    const duration = this.player.duration()
    const percent = videojs.dom.getPointerPosition(this.progressBar, event).x
    const formattedTime = videojs.time.formatTime(percent * duration, duration)
    this.timestampLabel.innerHTML = formattedTime.toString()

    const time = percent * duration
    const currentThumbnailStyle = this.getStyleForTime(time)

    for (const style in currentThumbnailStyle) {
      if (currentThumbnailStyle.hasOwnProperty(style)) {
        this.thumbHolder.style[style] = currentThumbnailStyle[style];
      }
    }

    // Place thumbnail at correct position
    const halfThumbnailWidth = this.thumbHolder.getBoundingClientRect().width / 2
    const progressBarWidth = this.progressBar.offsetWidth
    const xPos = percent * progressBarWidth
    if (xPos < halfThumbnailWidth) {
      // mouse is near the start of video
      this.thumbHolder.style.transform = `translateX(0)`
    } else if (progressBarWidth - xPos < halfThumbnailWidth) {
      // mouse is near the end of video
      this.thumbHolder.style.transform = `translateX(${progressBarWidth - halfThumbnailWidth*2}px)`
    } else {
      this.thumbHolder.style.transform = `translateX(${xPos - halfThumbnailWidth}px)`
    }
  }

  getStyleForTime(time) {
    if (!this.vttData) return {}

    for (let i = 0; i < this.vttData.length; i++) {
      const cue = this.vttData[i]
      if (time >= cue.start && time <= cue.end) {
        return cue.css
      }
    }

    return {}
  }


  getSecondsFromTimestamp(vttTimestamp) {
    const parts = vttTimestamp.split(':')
    const hours = parseInt(parts[0], 10)
    const minutes = parseInt(parts[1], 10)
    const secondsParts = parts[2].split('.')
    const seconds = parseInt(secondsParts[0], 10)
    const milliseconds = parseInt(secondsParts[1], 10) / 1000
    return hours * 3600 + minutes * 60 + seconds + milliseconds
  }

  showThumbnailHolder() {
    this.thumbHolder.style.display = 'block';
  }

  hideThumbnailHolder() {
    this.thumbHolder.style.display = 'none';
  }

  dispose() {
    this.progressBar.removeEventListener('mouseenter', this.onProgressBarMouseEnter)
    this.progressBar.removeEventListener('mouseleave', this.onProgressBarMouseLeave)
    super.dispose();
  }
}

videojs.registerPlugin('vttPreviewThumbnail', VttPreviewThumbnail)
VttPreviewThumbnail.VERSION = packageInfo.version

export default VttPreviewThumbnail