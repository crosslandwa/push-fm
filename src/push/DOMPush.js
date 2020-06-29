import React from 'react'
import { connect } from 'react-redux'
import { activeGridSelect, activePads, gridPadPressed, gridSelectPressed } from './'
import range from '../range'

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

const DOMPush = ({ activeGridSelect, activePads, gridPadPressed, gridSelectPressed }) => (
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
)

export default connect(mapStateToProps, { gridPadPressed, gridSelectPressed })(DOMPush)
