<template>
  <el-card shadow="never" class="main-card">
    <template #header>
      <div class="card-header">
        <span class="title">活动项目管理</span>
        <div>
          <el-button type="primary" plain @click="addStage">
            <el-icon style="margin-right: 3px"><Plus /></el-icon>
            增加项目
          </el-button>
          <el-button type="success" @click="createStage" plain>提交新增</el-button>
        </div>
      </div>
    </template>
    <div class="stage-list">
      <div v-for="(stage, index) in stages" :key="index">
        <div class="stage-item">
          <el-input v-model="stage.map_id" placeholder="谱面BeatmapID（纯数字）" clearable style="width: 240px" :disabled="!stage.editable"></el-input>
          <el-input v-model="stage.artist" placeholder="曲师" clearable style="width: 200px" :disabled="!stage.editable"></el-input>
          <el-input v-model="stage.title" placeholder="曲名" clearable style="width: 440px" :disabled="!stage.editable"></el-input>
          <el-input v-model="stage.mapper" placeholder="谱师" clearable style="width: 240px" :disabled="!stage.editable"></el-input>
        </div>
        <div class="stage-item">
          <el-image :src="stage.url" style="width: 100px" :preview-src-list="[stage.url]" v-if="stage.url"></el-image>
          <el-upload
              :file-list="stage.fileList"
              :before-upload="(file) => handleFileChange(file, stage, index)"
              :limit="1"
              v-else
          >
            <el-button>上传BG</el-button>
          </el-upload>
          <el-button type="warning" plain @click="stage.editable = true;" v-if="!stage.editable">修改此项目</el-button>
          <el-button type="warning" plain @click="editStage(stage)" v-if="stage.id && stage.editable">确定修改</el-button>
          <el-button type="danger" plain @click="removeStage(stage, index)">删除此项目</el-button>
        </div>
        <el-divider content-position="right">Stage {{ index + 1 }}</el-divider>
      </div>
    </div>
    <el-empty description="暂无项目" v-if="stages.length === 0"/>
  </el-card>
</template>

<script setup>
import { Plus } from "@element-plus/icons-vue";
import { ref, onBeforeMount, reactive, computed } from "vue";
import { useRoute } from "vue-router";
import { ElMessage, ElMessageBox, genFileId } from "element-plus";
import { stageCreate, stageUpdate, stageDelete, eventStages } from "@/api/event.js";

const route = useRoute();

const event_id = route.params.event_id;

const stages = reactive([]);

const addStage = () => {
  stages.push({ map_id: null, artist: '', title: '', mapper: '', desc: '', file: null, editable: true });
}

const removeStage = (stage, index) => {
  if(!stage.id){
    stages.splice(index, 1);
  }
  else{
    ElMessageBox.confirm(
        `此操作无法恢复，确认删除此项目？`,
        '警告',
        {
          confirmButtonText: '确认删除',
          cancelButtonText: '取消',
          type: 'warning',
        }
    ).then(() => {
      stageDelete(stage.id).then(() => {
        ElMessage.success('删除成功')
        getStages();
      }).catch(err => {
        ElMessage.error(err)
      })
    }).catch(() => {
      ElMessage({
        type: 'info',
        message: '取消删除操作',
      })
    })
  }
}

const handleFileChange = (file, stage, index) => {
  if(file.size / 1024 / 1024 > 1){
    ElMessage.error('BG需小于1MB，防止加载过慢，请重传')
    return false;
  }
  stage.file = file;
  stage.fileList = [{ name: file.name }];
  return false; // 阻止自动上传
};

const getStages = async () => {
  stages.length = 0
  await eventStages(event_id).then((res) => {
    stages.push(...res.data.map(stage => ({ ...stage, editable: false })));
  })
}

const createStage = async () => {
  const formData = new FormData();
  formData.append("event_id", event_id);
  const stageData = stages.filter(stage => !stage.id).map(stage => ({
    map_id: stage.map_id,
    artist: stage.artist,
    title: stage.title,
    mapper: stage.mapper,
    desc: stage.desc
  }));
  formData.append("stages", JSON.stringify(stageData));
  stages.forEach((stage) => {
    if (!stage.id && stage.file) {
      formData.append(`file`, stage.file);
    }
  });
  try {
    stageCreate(formData).then(() => {
      getStages();
    }).catch(() => {
      getStages();
    })
  } catch (error) {
    console.log(error);
  }
}

const editStage = (stage) => {
  stageUpdate(stage.id, stage).then(() => {
    getStages();
  }).catch(() => {
    getStages();
  })
}

onBeforeMount(() => {
  getStages();
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
.stage-item{
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}
.stage-list {
  max-height: calc(100vh - 180px);
  overflow-y: auto;
  padding-right: 10px;
}
</style>