import { IRecordReplayer, MultiRecordReplayer } from "@codereplay/types"
import { useSession } from "next-auth/react"
import { useCallback, useEffect, useRef, useState } from "react"

const PlayerControls: React.FC<{
  recordReplayer: MultiRecordReplayer
}> = ({ recordReplayer }) => {
  const { data } = useSession()
  const [wasPlaying, setWasPlaying] = useState(false)
  const [value, setValue] = useState(0)
  const [state, setState] = useState<IRecordReplayer.State>("paused")
  const [hasSource, setHasSource] = useState(false)

  useEffect(() => {
    recordReplayer.addStateListener((s) => setState(s))
    recordReplayer.addEventListener((e) => {
      if (e === "ended") {
        setValue(0)
      } else if (e === "srcChanged") {
        setHasSource(recordReplayer.src !== undefined)
      }
    })
  }, [recordReplayer])

  const handleChange = useCallback(
    (event) => {
      recordReplayer.percent = event.target.value
      setValue(event.target.value)
    },
    [recordReplayer]
  )

  const timer = useRef<ReturnType<typeof setInterval>>()
  useEffect(() => {
    if (state === "playing") {
      timer.current = setInterval(() => {
        setValue(recordReplayer.percent)
      }, 100)
    } else {
      timer.current && clearInterval(timer.current)
    }
  }, [state, recordReplayer])

  const [playbackRate, setPlaybackRate] = useState("1.0")
  useEffect(() => {
    recordReplayer.playbackRate = parseFloat(playbackRate)
  }, [playbackRate, recordReplayer])

  return (
    <div>
      <div style={{ display: "flex", width: "100%", flexDirection: "row", alignItems: "center" }}>
        <button
          disabled={state === "paused" && !hasSource}
          onClick={() => {
            if (state === "paused") {
              recordReplayer.play()
            } else if (state === "recording") {
              recordReplayer.stop()
            } else {
              recordReplayer.pause()
            }
          }}
        >
          {state === "paused" ? <>Play</> : state === "recording" ? <>Stop</> : <>Pause</>}
        </button>
        <button
          disabled={!data || state !== "paused"}
          onClick={() => {
            recordReplayer.record()
          }}
        >
          Record
        </button>
        <button
          disabled={!hasSource || state === "recording"}
          onClick={() => {
            if (state === "playing") {
              recordReplayer.pause()
            }
            recordReplayer.src = undefined
          }}
        >
          Clear
        </button>
        <button
          disabled={state !== "paused"}
          onClick={() => {
            Object.values(recordReplayer.ace.players).forEach((player) => {
              player.editor.setValue("")
              player.editor.clearSelection()
            })
          }}
        >
          Reset
        </button>
        <select id="playbackRate" onChange={(e) => setPlaybackRate(e.target.value)} value={playbackRate.toString()}>
          <option value="0.5">0.5</option>
          <option value="1.0">1.0</option>
          <option value="2.0">2.0</option>
        </select>
      </div>
      <input
        disabled={state === "recording"}
        type="range"
        min="0"
        max="100"
        step="1"
        onChange={handleChange}
        onMouseDown={() => {
          if (state === "playing" && !wasPlaying) {
            setWasPlaying(true)
            recordReplayer.pause()
          }
        }}
        onMouseUp={() => {
          wasPlaying && recordReplayer.play()
          setWasPlaying(false)
        }}
        value={value}
        style={{ width: "100%" }}
      />
    </div>
  )
}
export default PlayerControls
