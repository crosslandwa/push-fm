import React from 'react'
import { connect } from 'react-redux'
import './app.css'
import { playingNotes } from './ui'
import { gridPadPressed } from './push'

const mapStateToProps = state => ({
  activePads: playingNotes(state).reduce((acc, it) => ({ ...acc, [it]: [220, 230, 20] }), {})
})

const range = (start, end) => [...Array(end - start).keys()].map(x => x + start)

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

const App = ({ activePads, gridPadPressed }) => (
  <>
    <h1>Push FM</h1>
    <div class="push-body">
      <div class="push-grid-select">
        {range(0, 8).map(x => <GridSelectButton x={x} />)}
      </div>
      <div class="push-grid">
        {range(0, 64).map(i => (
          <GridButton x={i % 8} y={parseInt(i / 8)} onClick={gridPadPressed} rgb={activePads[i]} />
        ))}
      </div>
    </div>
  </>
)

export default connect(mapStateToProps, { gridPadPressed })(App)
