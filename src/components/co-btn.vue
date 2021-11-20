<!--
  co-btn 组件
  增加一个 square 属性，显示直角边的按钮。
-->
<template>
  <q-btn
    ref="btn"
    v-bind="$attrs"
    v-on="$listeners"
    class="co-btn"
    :class="{'co-btn--square':_square()}"
    :dense="_dense()"
    :flat="_flat()"
    :outline="_outline()"
    :push="_push()"
    :unelevated="_unelevated()"
    :rounded="_rounded()"
    :icon="icon"
    :label="label"
    >
    <template v-for="slotName in Object.keys($slots)" v-slot:[slotName]>
      <slot :name="slotName"/>
    </template>
  </q-btn>
</template>

<script>
import Setting from '@/default-setting'

export default {
  name: 'CoBtn',
  inheritAttrs: false,
  props: {
    dense: {
      type: Boolean,
      default: undefined
    },
    flat: {
      type: Boolean,
      default: undefined
    },
    outline: {
      type: Boolean,
      default: undefined
    },
    push: {
      type: Boolean,
      default: undefined
    },
    unelevated: {
      type: Boolean,
      default: undefined
    },
    square: {
      type: Boolean,
      default: undefined
    },
    rounded: {
      type: Boolean,
      default: undefined
    },
    round: {
      type: Boolean,
      default: undefined
    },
    icon: {
      type: String,
      default: undefined
    },
    label: {
      type: String,
      default: undefined
    }

  },
  methods: {
    _dense() {
      if (this.dense === undefined) {
        return Setting.denseMode
      } else {
        return this.dense
      }
    },
    _flat() {
      const undef = this.flat === undefined && this.outline === undefined && this.push === undefined && this.unelevated === undefined
      if (!undef) {
        return this.flat
      }
      if (Setting.btnDesignMode === 'flat') {
        return true
      } else {
        return false
      }
    },
    _outline() {
      const undef = this.flat === undefined && this.outline === undefined && this.push === undefined && this.unelevated === undefined
      if (!undef) {
        return this.outline
      }
      if (Setting.btnDesignMode === 'outline') {
        return true
      } else {
        return false
      }
    },
    _push() {
      const undef = this.flat === undefined && this.outline === undefined && this.push === undefined && this.unelevated === undefined
      if (!undef) {
        return this.push
      }
      if (Setting.btnDesignMode === 'push') {
        return true
      } else {
        return false
      }
    },
    _unelevated() {
      const undef = this.flat === undefined && this.outline === undefined && this.push === undefined && this.unelevated === undefined
      if (!undef) {
        return this.unelevated
      }
      if (Setting.btnDesignMode === 'unelevated') {
        return true
      } else {
        return false
      }
    },

    _square() {
      const undef = this.rounded === undefined && this.square === undefined
      if (!undef) {
        return this.square
      }
      if (Setting.btnDesignCorner === 'square') {
        return true
      } else {
        return false
      }
    },
    _rounded() {
      const undef = this.rounded === undefined && this.square === undefined
      if (!undef) {
        return this.rounded
      }
      if (Setting.btnDesignCorner === 'rounded') {
        return true
      } else {
        return false
      }
    },

    click(evt) {
      this.$refs.btn.click(evt)
    }
  }
}
</script>
