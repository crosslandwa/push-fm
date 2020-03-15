import React from 'react'
import { connect } from 'react-redux'
import './app.css'
import { activeGridSelect, activePads } from './ui'
import FmSynth from './fm-synth/FmSynth'
import { gridPadPressed, gridSelectPressed } from './push'
import range from './range'

const mapStateToProps = state => ({
  activeGridSelect: activeGridSelect(state),
  activePads: activePads(state)
})

const GridButton = ({ onClick, rgb = [255, 255, 255], x, y }) => (
  <button
    class={`push-grid__button push-grid__button--x-${x} push-grid__button--y-${y}`}
    onClick={() => onClick(x, y, 100)}
    style={{
      backgroundColor: `rgb(${rgb.join(',')})`
    }}
  />
)

const GridSelectButton = ({ onClick, rgb = [255, 255, 255], x }) => (
  <button
    class={`push-grid-select__button push-grid-select__button--x-${x}`}
    onClick={() => onClick(x)}
    style={{
      backgroundColor: `rgb(${rgb.join(',')})`
    }}
  />
)

const App = ({ activeGridSelect, activePads, gridPadPressed, gridSelectPressed }) => (
  <>
    <h1>Push FM</h1>
    <FmSynth />
    <div class="push-body">
      <div class="push-grid-select">
        {range(0, 7).map(x => <GridSelectButton x={x} onClick={gridSelectPressed} rgb={activeGridSelect[x]} />)}
      </div>
      <div class="push-grid">
        {range(7, 0).map(y => range(0, 7).map(x => (
          <GridButton x={x} y={y} onClick={gridPadPressed} rgb={activePads[x + (y * 8)]} />
        )))}
      </div>
    </div>
  </>
)

export default connect(mapStateToProps, { gridPadPressed, gridSelectPressed })(App)
