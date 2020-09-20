<template>
  <div id="minesweeper">
    <button @click="startOver">{{ status === 'BOOM' ? '😵' : status === 'WIN' ? '🤣' : '🙂' }}</button>
    <table>
      <tbody>
        <tr v-for="(cols, row) in grid" :key="row">
          <td v-for="(value, col) in cols" :key="col"
            v-bind:class="{ revealed: isRevealed(row, col), marked: isMarked(row, col) }"
            @contextmenu.prevent="markCell(row, col)"
            @click.prevent="revealCell(row, col)">
              {{ isMarked(row, col) ? '🚩' : isRevealed(row, col) ? value : '' }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

const GRID_SIZE = 10
const MINES_NUMBER = 20

const cellEqual = (row1: number, col1: number) => ([row2, col2]: [number, number]) => {
  return row1 === row2 && col1 === col2
}

const cellDiff = (row1: number, col1: number) => ([row2, col2]: [number, number]) => {
  return row1 !== row2 || col1 !== col2
}

export default Vue.extend({
  name: 'Minesweeper',
  data () {
    const grid: Array<Array<any>> = []
    const mines: Array<[number, number]> = []
    const revealeds: Array<[number, number]> = []
    const markeds: Array<[number, number]> = []
    return {
      status: 'WORKING',
      mines,
      revealeds,
      markeds,
      grid
    }
  },
  methods: {
    startOver () {
      this.revealeds = []
      this.markeds = []
      this.rearrangeMines()
      this.generateNewGrid()
      this.status = 'WORKING'
    },
    revealCell (row: number, col: number) {
      if (this.isMarked(row, col)) return
      if (this.isRevealed(row, col)) return
      if (this.status === 'BOOM') return
      if (this.isMined(row, col)) {
        this.revealAllMines()
        this.status = 'BOOM'
      } else if (this.isUnrevealedZero(row, col)) {
        this.revealSurrounding(row, col)
      } else {
        this.revealOnce(row, col)
      }
      if (GRID_SIZE * GRID_SIZE === this.revealeds.length + this.mines.length) {
        this.status = 'WIN'
      }
    },
    isRevealed (row: number, col: number) {
      return this.revealeds.some(cellEqual(row, col))
    },
    markCell (row: number, col: number) {
      if (this.isRevealed(row, col)) return
      if (this.status === 'BOOM') return
      if (!this.isMarked(row, col)) {
        this.markeds.push([row, col])
      } else {
        this.markeds = this.markeds.filter(cellDiff(row, col))
      }
    },
    isMarked (row: number, col: number) {
      return this.markeds.some(cellEqual(row, col))
    },
    isMined (row: number, col: number) {
      return this.mines.some(cellEqual(row, col))
    },
    revealOnce (row: number, col: number) {
      if (this.existsOnGrid(row, col) && !this.isRevealed(row, col)) {
        this.revealeds.push([row, col])
      }
    },
    isUnrevealedZero (row: number, col: number) {
      return this.existsOnGrid(row, col) && this.grid[row][col] === 0 && !this.isRevealed(row, col)
    },
    existsOnGrid (row: number, col: number) {
      return this.grid[row] !== undefined && this.grid[row][col] !== undefined
    },
    revealSurrounding (row: number, col: number) {
      const stack: Array<[number, number]> = [[row, col]]
      while (stack.length > 0) {
        const nextCell = stack.pop()
        if (!nextCell) break
        const [nextRow, nextCol]: [number, number] = nextCell
        this.revealOnce(nextRow, nextCol)
        for (let r = (nextRow - 1); r <= (nextRow + 1); r++) {
          for (let c = (nextCol - 1); c <= (nextCol + 1); c++) {
            this.isUnrevealedZero(r, c) ? stack.push([r, c]) : this.revealOnce(r, c)
          }
        }
      }
    },
    revealAllMines () {
      this.revealeds = this.revealeds.concat(this.mines)
    },
    rearrangeMines () {
      this.mines = []
      while (this.mines.length < MINES_NUMBER) {
        while (true) {
          const nextMine: [number, number] = [Math.floor(Math.random() * GRID_SIZE), Math.floor(Math.random() * GRID_SIZE)]
          if (!this.isMined(nextMine[0], nextMine[1])) {
            this.mines.push(nextMine)
            break
          }
        }
      }
    },
    generateNewGrid () {
      this.grid = []
      for (let row = 0; row < GRID_SIZE; row++) {
        this.grid.push([])
        for (let col = 0; col < GRID_SIZE; col++) {
          if (this.isMined(row, col)) {
            this.grid[row].push('💣')
          } else {
            this.grid[row].push(this.countAdjacentMines(row, col))
          }
        }
      }
    },
    countAdjacentMines (row: number, col: number) {
      let count = 0
      for (let a = (row - 1); a <= (row + 1); a++) {
        for (let b = (col - 1); b <= (col + 1); b++) {
          if (this.isMined(a, b)) {
            count++
          }
        }
      }
      return count
    }
  }
})
</script>

<style scoped>
button {
  font-size: 30px;
  width: 60px;
  height: 60px;
  margin-bottom: 10px;
  outline: none;
}
table {
  table-layout: fixed;
  margin: auto;
  width: 400px;
  height: 400px;
}
td {
  height: 35px;
  width: 35px;
  font-weight: 900;
}
td, button {
  background-color: darkgray;
  border-width: 4px;
  border-style: solid;
  border-bottom-color:gray;
  border-right-color: gray;
  border-top-color: lightgray;
  border-left-color: lightgray;
}
td:active:not(.marked), button:active, .revealed {
  border-color: darkgray;
}
</style>
