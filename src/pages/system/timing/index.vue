<!--
  定时任务
-->
<template>
  <div >
    <co-dialog title="查找" no-max seamless ref="search" @before-hide="filterTable=''">
      <co-input placeholder="在当前页查找" outlined v-model="filterTable" clearable class="q-mx-sm q-mt-none q-mb-sm"/>
    </co-dialog>
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
        label-width="medium"
        label-align="right"
        class="q-px-lg q-my-none row q-col-gutter-x-xl q-col-gutter-y-md">
          <co-input class="col-12" form-label="任务名称" v-model="form.jobName" :disable="!!crud.status.view" :rules="[
              val => (!!val) || '必填'
              ]"/>
          <co-input class="col-12" autogrow form-label="分组" v-model="form.groupName" :disable="!!crud.status.view" :rules="[
              val => (!!val) || '必填'
              ]"/>
          <co-input class="col-12" form-label="jobClass名称" v-model="form.jobClass" :disable="!!crud.status.view" :rules="[
              val => (!!val) || '必填'
              ]"/>
          <co-input class="col-12" form-label="json格式参数" v-model="form.param" :disable="!!crud.status.view" />
          <co-input class="col-12" form-label="Cron表达式" v-model="form.cronExpression" :disable="!!crud.status.view" :rules="[
              val => (!!val) || '必填'
              ]"/>
        <!--
          <co-field class="col-12" form-label="任务状态" :disable="!!crud.status.view">
            <template v-slot:control>
              <co-option-group
                v-model="form.isPause"
                value-to-string
                :disable="!!crud.status.view"
                inline
                :options="dict.jobs_status"
                type="radio"
              />
            </template>
          </co-field>
        -->
      </co-form>
      <q-card-actions class="q-px-lg q-pt-lg q-pb-md" align="right">
        <co-btn label="取消" flat v-close-popup/>
        <co-btn label="保存" color="primary" v-if="!crud.status.view" @click="crud.submitCU"
          :loading="crud.status.cu === crud.STATUS_PROCESSING" :disable="crud.status.cu === crud.STATUS_PROCESSING"/>
      </q-card-actions>
    </co-dialog>

    <co-table
      ref="table"
      row-key="id"
      sticky-header
      :data="crud.data"
      :columns="crud.columns"
      :visible-columns="crud.visibleColumns"
      :title="crud.title"
      :loading="crud.loading"
      selection="multiple"
      :selected.sync="crud.selections"
      :filter="filterTable"
      @row-click="(evt, row, index) => crud.selections = [row]"
      @row-dblclick="(evt, row, index) => crud.toView(row)"
    >
      <template v-slot:top-right="props">
        <div class='row q-col-gutter-x-sm q-col-gutter-y-xs q-px-xs q-py-xs full-width'>
          <co-select
            class="col-auto"
            label="状态"
            content-style="width:120px"
            v-model="query.triggerState"
            no-filter
            :options="dict.jobs_status"
            @input="crud.toQuery()"
            clearable
            emit-value
            map-options
          />
          <co-input
            v-model="query.jobName"
            label="名称"
            content-style="width:200px"
            clearable
            @change="crud.toQuery()"
            @clear="crud.toQuery()"
          />
          <div>
            <co-btn color="primary" icon="search" @click="crud.toQuery()" />
          </div>
          <q-space/>
          <crud-operation :permission="permission" noDel>
            <template v-slot:end>
              <!-- 任务日志 -->
              <co-btn label="任务日志" color="info" padding="xs sm" />
            </template>         </crud-operation>
          <div>
            <co-btn-dropdown color="primary" class="btn-dropdown-hide-droparrow" icon="apps" auto-close>
              <crud-more :tableSlotTopProps="props">
                <template v-slot:start>
                  <co-btn flat align="left" label="在当前页查找" icon="find_in_page" @click.native="$refs.search.show()" />
                  <q-separator/>
                </template>
              </crud-more>
            </co-btn-dropdown>
          </div>
        </div>
      </template>

      <template v-slot:body-cell-triggerState="props">
        <q-td key="triggerState" :props="props">
          {{dict.label.jobs_status[props.row.triggerState]}}
        </q-td>
      </template>

      <template v-slot:body-cell-action="props">
        <q-td :props="props">
          <co-btn label="执行" flat color="positive" @click="execute(props.row)"/>
          <co-btn flat color="primary" @click="updateStatus(props.row)">
            <template v-if="props.row.triggerState ==='PAUSED'">
              恢复
            </template>
            <template v-else>
              暂停
            </template>
          </co-btn>
          <co-btn label="删除" flat color="negative" @click="delItem(props.row)"/>
        </q-td>
      </template>

      <template v-slot:pagination>
        <crud-pagination />
      </template>

    </co-table>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import CrudOperation from '@crud/crud-operation'
import CrudPagination from '@crud/crud-pagination'
import CrudMore from '@crud/crud-more'
import crudTiming from '@/api/system/timing'

const defaultForm = { jobName: null, groupName: null, jobClass: null, param: null, cronExpression: null }
const visibleColumns = ['jobName', 'groupName', 'cronExpression', 'isPause', 'jobClass', 'param', 'triggerState', 'action']
const columns = [
  { name: 'jobName', field: 'jobName', label: '名称', required: true, align: 'left' },
  { name: 'groupName', field: 'groupName', label: '任务分组', align: 'left' },
  { name: 'jobClass', field: 'jobClass', label: '执行方法', sortable: true },
  { name: 'cronExpression', field: 'cronExpression', label: 'Corn表达式' },
  { name: 'param', field: 'param', label: '参数内容' },
  { name: 'triggerState', field: 'triggerState', label: '状态' },
  { name: 'action', label: '操作', align: 'center' }
]

export default {
  name: 'Timing',
  components: { CrudOperation, CrudMore, CrudPagination },
  cruds() {
    return CRUD({ columns, visibleColumns, idField: 'jobName', sort: ['jobName,desc'], title: '定时任务', url: 'api/quartz', crudMethod: { ...crudTiming } })
  },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  data () {
    return {
      permission: {
        add: ['admin', 'timing:add'],
        edit: ['admin', 'timing:edit'],
        del: ['admin', 'timing:del']
      },
      filterTable: ''
    }
  },
  computed: {
    ...mapGetters('permission', [
      'dict'
    ])
  },
  methods: {
    execute(data) {
      crudTiming.execution(data).then(res => {
        this.crud.notify('执行成功', CRUD.NOTIFICATION_TYPE.SUCCESS)
      }).catch(err => {
        console.log(err.response.data.message)
      })
    },
    updateStatus(data) {
      if (data.triggerState === 'PAUSED') {
        crudTiming.resumeJob(data).then(res => {
          this.crud.toQuery()
          this.crud.notify(status + '成功', CRUD.NOTIFICATION_TYPE.SUCCESS)
        }).catch(err => {
          console.log(err.response.data.message)
        })
      } else {
        crudTiming.pauseJob(data).then(res => {
          this.crud.toQuery()
          this.crud.notify(status + '成功', CRUD.NOTIFICATION_TYPE.SUCCESS)
        }).catch(err => {
          console.log(err.response.data.message)
        })
      }
    },
    delItem(data) {
      crudTiming.del(data).then(res => {
        this.crud.toQuery()
        this.crud.notify(status + '成功', CRUD.NOTIFICATION_TYPE.SUCCESS)
      }).catch(err => {
        console.log(err.response.data.message)
      })
    }
  }
}
</script>
