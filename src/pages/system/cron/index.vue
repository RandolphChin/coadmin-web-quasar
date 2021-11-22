<template>
  <div>
    <co-dialog title="查找当前表格" seamless no-max ref="search" @before-hide="filterTable=''">
      <co-input autofocus clearable style="width:180px" placeholder="" v-model="filterTable" class="q-mx-sm q-mt-none q-mb-sm" @keyup.escape.native="$refs.search.hide()"/>
    </co-dialog>

    <!-- 编辑表单对话框 -->
    <co-dialog
      ref="formDialog"
      :value="crud.status.cu > 0"
      :title="crud.status.title"
      no-backdrop-dismiss
      @before-hide="crud.cancelCU"
      card-style="width:600px; max-width:95vw;"
    >
      <co-form
        ref="form"
        :label-width="$q.screen.lt.sm?'xsmall':'medium'"
        label-align="right"
        class="q-px-lg q-my-none row q-col-gutter-x-md q-col-gutter-y-md">
        <co-input class="col-12" form-label="星期几" v-model="form.name" :disable="!!crud.status.view"
                  />
        <co-input class="col-12" form-label="开机cron表达式" v-model="form.cronOpen" :disable="!!crud.status.view"
                  />
        <co-input class="col-12" form-label="关机cron表达式" v-model="form.cronClose" :disable="!!crud.status.view"
                  />
        <co-field class="col-12" form-label="ID" :value="form.id" readonly borderless/>
      </co-form>
      <q-card-actions class="q-px-lg q-pt-lg q-pb-md" align="right">
        <co-btn label="取消" flat v-close-popup/>
        <co-btn label="保存" color="primary"
                v-if="!crud.status.view"
                @click="crud.submitCU"
               :loading="crud.status.cu === crud.STATUS_PROCESSING"
               :disable="crud.status.cu === crud.STATUS_PROCESSING"/>
      </q-card-actions>
    </co-dialog>

    <co-table
        ref="table"
        row-key="id"
        :data="crud.data"
        :columns="crud.columns"
        :visible-columns="crud.visibleColumns"
        :title="crud.title"
        :loading="crud.loading"
        :filter="filterTable"
        :selected.sync="crud.selections"
        selection="multiple"
        @row-click="(evt, row, index) => crud.selections = [row]"
        @row-dblclick="(evt, row, index) => crud.toView(row)"
    >
      <template v-slot:top-left>
        <div class='row q-col-gutter-x-sm q-col-gutter-y-xs q-pa-xs full-width'>
          <co-input
              v-model="query.name"
              label="星期几"
              content-style="width:160px"
              @change="crud.toQuery()"
              clearable
          />
          <co-input
              v-model="query.cronOpen"
              label="开机cron表达式"
              content-style="width:160px"
              @change="crud.toQuery()"
              clearable
          />
          <co-input
              v-model="query.cronClose"
              label="关机cron表达式"
              content-style="width:160px"
              @change="crud.toQuery()"
              clearable
          />
          <!-- 点击“更多..”才显示的搜索项 -->
          <div>
            <co-btn label="搜索" icon="search" color="positive" padding="xs sm" @click="crud.toQuery()" />
            <co-btn label="重置" icon="replay" color="warning" padding="xs sm" @click="crud.resetQuery()" class="q-ml-sm" />
          </div>
          <q-space/>
        </div>
      </template>
      <template v-slot:top-right="props">
        <div class='row q-col-gutter-x-sm q-col-gutter-y-xs q-pa-xs full-width'>
          <!--如果想在工具栏加入更多按钮，可以使用插槽方式， 'start' or 'end'-->
          <crud-operation :permission="permission" no-view/>
          <div>
            <co-btn-dropdown color="primary" class="btn-dropdown-hide-droparrow" icon="apps" auto-close>
              <crud-more :tableSlotTopProps="props">
                <template v-slot:start>
                  <co-btn flat align="left" label="查找当前页" icon="find_in_page" @click.native="$refs.search.show()" />
                  <q-separator/>
                </template>
              </crud-more>
            </co-btn-dropdown>
          </div>
        </div>
      </template>

      <template v-slot:body-cell-action="props">
        <q-td key="action" :props="props">
          <crud-row
              type="button"
              :data="props.row"
              :permission="permission"
              flat
              no-add
              no-icon
              no-edit
          />
        </q-td>
      </template>

      <template v-slot:pagination>
        <crud-pagination />
      </template>

    </co-table>
  </div>
</template>

<script>

import { required, integer, between } from '@/utils/vuelidate'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import CrudOperation from '@crud/crud-operation'
import CrudPagination from '@crud/crud-pagination'
import CrudRow from '@crud/crud-row'
import CrudMore from '@crud/crud-more'
import CrudChargerCron from '@/api/cron/charger-cron'

const defaultForm = { name: null, cronOpen: null, cronClose: null, status: null, jobId: null, jobWeek: null, id: null }

const visibleColumns = ['name', 'cronOpen', 'cronClose', 'status', 'jobId', 'jobWeek', 'id', 'action']
// 参考：https://quasar.dev/vue-components/table#Defining-the-columns
const columns = [
  { name: 'name', field: 'name', label: '星期几', align: 'left' },
  { name: 'cronOpen', field: 'cronOpen', label: '开机cron表达式', align: 'left' },
  { name: 'cronClose', field: 'cronClose', label: '关机cron表达式', align: 'left' },
  { name: 'status', field: 'status', label: '是否暂停', align: 'left' },
  { name: 'jobId', field: 'jobId', label: '场馆', align: 'left' },
  { name: 'jobWeek', field: 'jobWeek', label: '场馆与星期数组合', align: 'left' },
  { name: 'id', field: 'id', label: 'ID', align: 'left' },
  { name: 'action', label: '操作', align: 'center', required: false, sortable: false }
]

export default {
  name: 'ChargerCron',
  components: { CrudOperation, CrudMore, CrudPagination, CrudRow },
  cruds() {
    return CRUD({ columns, visibleColumns, title: 'CRON定时', idField: 'id', sort: ['id,desc'], url: 'api/cron', crudMethod: { ...CrudChargerCron } })
  },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  data () {
    return {
      permission: {
        view: ['admin', 'chargerCron:list'],
        add: ['admin', 'chargerCron:add'],
        edit: ['admin', 'chargerCron:edit'],
        del: ['admin', 'chargerCron:del']
      },
      filterTable: ''
    }
  },
  created () {
    this.crud.updateProp('queryMore', false)
  },
  mounted () {
  },
  methods: {
    required,
    integer,
    between,
    [CRUD.HOOK.beforeRefresh] () {
      console.log('chargerCron CRUD.HOOK.beforeRefresh')
    }
  }
}
</script>

<style scoped>

</style>
