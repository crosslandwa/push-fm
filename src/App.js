import React from 'react'
import { connect } from 'react-redux'
import './app.css'
import { activePads } from './ui'
import FmSynth from './fm-synth/FmSynth'
import { gridPadPressed } from './push'

const mapStateToProps = state => ({
  activePads: activePads(state)
})

const range = (start, end) => end > start
  ? [...Array((end + 1) - start).keys()].map(x => x + start)
  : [...Array((start + 1) - end).keys()].map(x => x + end).reverse()

const GridButton = ({ onClick, rgb = [255, 255, 255], x, y }) => (
  <button
    class={`push-grid__button push-grid__button--x-${x} push-grid__button--y-${y}`}
    onClick={() => onClick(x, y, 100)}
    style={{
      backgroundColor: rgb && `rgb(${rgb.join(',')})`
    }}
  />
)

const GridSelectButton = ({ x }) => (
  <button class={`push-grid-select__button push-grid-select__button--x-${x}`} />
)

const App = ({ activePads, gridPadPressed, modLevel, updateModLevel }) => (
  <>
    <h1>Push FM</h1>
    <FmSynth />
    <div class="push-body">
      <div class="push-grid-select">
        {range(0, 7).map(x => <GridSelectButton x={x} />)}
      </div>
      <div class="push-grid">
        {range(7, 0).map(y => range(0, 7).map(x => (
          <GridButton x={x} y={y} onClick={gridPadPressed} rgb={activePads[x + (y * 8)]} />
        )))}
      </div>
    </div>
  </>
)

export default connect(mapStateToProps, { gridPadPressed })(App)
