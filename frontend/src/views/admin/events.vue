<template>
  <el-card shadow="never" class="main-card">
    <template #header>
      <div class="card-header">
        <span class="title">活动管理</span>
        <div>
          <el-switch v-model="isActive" active-text="仅查看进行中" :loading="loading" @change="getEventList"></el-switch>
          <el-divider direction="vertical" style="margin: 0 20px"></el-divider>
          <el-button type="primary" plain @click="openCreate">
            <el-icon style="margin-right: 3px"><Plus /></el-icon>
            创建活动
          </el-button>
        </div>
      </div>
    </template>
    <div>
      <el-scrollbar max-height="90%">
        <el-table :data="events" class="event-table" v-loading="loading">
          <el-table-column prop="id" label="ID" align="center" min-width="153px"></el-table-column>
          <el-table-column prop="name" label="活动名" align="center" min-width="350px"></el-table-column>
          <el-table-column label="活动开始时间" align="center" min-width="200px">
            <template v-slot:default="scope">
              {{ formatDate(scope.row.start) }}
            </template>
          </el-table-column>
          <el-table-column label="活动结束时间" align="center" min-width="200px">
            <template v-slot:default="scope">
              {{ formatDate(scope.row.end) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" min-width="300px">
            <template v-slot:default="scope">
              <el-button type="info" plain size="small" @click="goToEvent(scope.row.id)">
                <el-icon><Link></Link></el-icon>
              </el-button>
              <el-button type="primary" plain size="small" @click="goToEventStage(scope.row.id)">详情</el-button>
              <el-button type="success" plain size="small" @click="editEvent(scope.row.id)">修改</el-button>
              <el-button type="danger" plain size="small" @click="deleteEvent(scope.row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
            :current-page="currentPage"
            :page-size="pageSize"
            :total="totalEvents"
            @current-change="handlePageChange"
        />
      </el-scrollbar>
    </div>
  </el-card>

  <el-dialog v-model="eventAdd" style="padding-top: 20px" width="800px">
    <div style="min-width: 400px">
      <el-form :model="editForm">
        <el-form-item label="活动名（必填）">
          <el-input v-model="editForm.name"></el-input>
        </el-form-item>
        <el-form-item label="活动介绍">
          <wangEditor v-model="editForm.desc"></wangEditor>
        </el-form-item>
        <el-form-item label="活动时间（必填）">
          <el-date-picker v-model="editForm.time" type="datetimerange" start-placeholder="起始时间" end-placeholder="结束时间"></el-date-picker>
        </el-form-item>
      </el-form>
    </div>
    <div>
      <el-button type="success" @click="submitCreate">
        <span>确定创建</span>
      </el-button>
    </div>
  </el-dialog>

  <el-dialog v-model="eventEdit" style="padding-top: 20px" width="800px">
    <div style="min-width: 400px">
      <el-form :model="editForm">
        <el-form-item label="活动名（必填）">
          <el-input v-model="editForm.name"></el-input>
        </el-form-item>
        <el-form-item label="活动介绍">
          <wangEditor v-model="editForm.desc"></wangEditor>
        </el-form-item>
        <el-form-item label="活动时间（必填）">
          <el-date-picker v-model="editForm.time" type="datetimerange" start-placeholder="起始时间" end-placeholder="结束时间"></el-date-picker>
        </el-form-item>
      </el-form>
    </div>
    <div>
      <el-button type="success" @click="submitEdit">
        <span>确定修改</span>
      </el-button>
    </div>
  </el-dialog>
</template>

<script setup>
import { Link, Plus } from "@element-plus/icons-vue";
import { eventCreate, eventDelete, eventInfo, eventList, eventUpdate } from "@/api/event.js"
import router from "@/router";
import { dayjs } from "element-plus";
import { ref, onBeforeMount, reactive } from "vue";
import wangEditor from "@/components/wangEditor.vue";

const eventAdd = ref(false);
const eventEdit = ref(false);
const editForm = reactive({
  name: '',
  desc: '',
  time: []
});
const editEventId = ref(null);
const loading = ref(false);
const isActive = ref(false);

const events = ref([]);

const currentPage = ref(1)
const pageSize = ref(8)
const totalEvents = ref(0)

const goToEvent = (event_id) => {
  router.push(`/event/${event_id}`)
}

const goToEventStage = (event_id) => {
  router.push(`/admin/events/${event_id}/stage`)
}

const openCreate = () => {
  resetForm();
  eventAdd.value = true;
}

const handlePageChange = (page) => {
  currentPage.value = page;
  getEventList()
};

const formatDate = (dateString) => {
  return dayjs(dateString).format('YYYY-MM-DD HH:mm:ss');
}

const getEventList = () => {
  loading.value = true;
  eventList(currentPage.value, pageSize.value, isActive.value, false).then((res) => {
    events.value = res.data;
    totalEvents.value = res.total;
    loading.value = false;
  }).catch(() => {
    loading.value = false;
  })
}

const editEvent = (id) => {
  resetForm();
  editEventId.value = id;
  eventInfo(id).then(res => {
    editForm.name = res.data.name;
    editForm.desc = res.data.desc;
    editForm.time = [res.data.start, res.data.end];
    eventEdit.value = true;
  })
}

const deleteEvent = (id) => {
  eventDelete(id).then(() => {
    getEventList();
  })
}

const resetForm = () => {
  editForm.name = "";
  editForm.desc = "";
  editForm.time = [];
}

const submitCreate = () => {
  const form = {
    name: editForm.name,
    desc: editForm.desc,
    start: editForm.time[0],
    end: editForm.time[1],
  }
  eventCreate(form).then(() => {
    getEventList();
    eventAdd.value = false;
  })
}

const submitEdit = () => {
  const form = {
    name: editForm.name,
    desc: editForm.desc,
    start: editForm.time[0],
    end: editForm.time[1],
  }
  eventUpdate(editEventId.value, form).then(() => {
    getEventList();
    eventEdit.value = false;
  })
}

onBeforeMount(() => {
  getEventList();
})

</script>

<style scoped>
.main-card{
  height: calc(100vh - 80px);
}
.card-header{
  display: flex;
  justify-content: space-between;
}
.title{
  display: flex;
  align-items: center;
}
.event-table{
  margin-bottom: 10px;
}
</style>