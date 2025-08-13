<template>
  <div v-cloak>
    <navMenu></navMenu>
    <el-row justify="center">
      <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <div class="userEdit-header">
                <el-icon><Tools /></el-icon>
                <span>{{ t('user.edit.title') }}</span>
              </div>
            </div>
          </template>
          <div>
            <el-form :model="form" :rules="rules" ref="formRef" label-width="auto" :label-position="getLabelPosition" style="max-width: 600px">
              <p class="form-sub-title">{{ t('user.edit.editPassword') }}</p>
              <el-form-item :label="t('user.edit.password')" prop="password">
                <el-input v-model="form.password" type="password" show-password></el-input>
              </el-form-item>
              <el-form-item :label="t('user.edit.confirmPassword')" prop="confirmPassword">
                <el-input v-model="form.confirmPassword" type="password" show-password></el-input>
              </el-form-item>
              <el-divider></el-divider>
              <p class="form-sub-title">{{ t('user.edit.editInfo') }}</p>
              <el-form-item label="QQ">
                <el-input v-model="form.info.qq"></el-input>
              </el-form-item>
              <el-form-item label="Discord">
                <el-input v-model="form.info.discord"></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="submitForm">{{ t('user.edit.save') }}</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import navMenu from "@/components/navmenu.vue";
import { Tools } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
import { reactive, onBeforeMount, computed, ref } from "vue";
import { userInfo, userUpdate } from "@/api/user.js";
import { useBreakpoints } from "@vueuse/core";
import router from "@/router";
import { ElMessage } from "element-plus";

const { t } = useI18n();

const formRef = ref(null);
const form = reactive({
  info: {},
  password: "",
  confirmPassword: ""
})

const rules = {
  password: [
    { min: 6, message: () => t('user.edit.passwordMinLength'), trigger: "blur" }
  ],
  confirmPassword: [
    {
      validator: (rule, value, callback) => {
        if (form.password) {
          if (!value) {
            return callback(new Error(t('user.edit.confirmPasswordRequired')));
          }
          if (value !== form.password) {
            return callback(new Error(t('user.edit.passwordNotMatch')));
          }
        }
        callback();
      },
      trigger: "blur"
    }
  ]
};

const breakpoints = useBreakpoints({
  tablet: 768,
  laptop: 992,
  desktop: 1200,
});

const isMobile = breakpoints.smaller('tablet');
const isTablet = breakpoints.between('tablet', 'laptop');

const getUserInfo = () => {
  userInfo().then(res => {
    Object.assign(form.info, res.data)
  })
}

const submitForm = () => {
  formRef.value.validate(valid => {
    if (!valid) return;
    const payload = {
      qq: form.info.qq,
      discord: form.info.discord
    };
    if (form.password) {
      payload.password = form.password;
    }
    userUpdate(form.info.user_id, payload).then(() => {
      ElMessage.success(t('user.edit.updateSuccess'));
      router.push({ path: `/user/${form.info.user_id}` });
    });
  });
};

const getLabelPosition = () => {
  return isMobile ? "top" : "left"
}

onBeforeMount(() => {
  getUserInfo();
})

</script>

<style scoped>
[v-cloak]{
  display: none !important;
}
:deep(.el-card .el-card__header){
  padding: 1.5vh 15px;
}
.card-header{
  display: flex;
  justify-content: space-between;
}
.userEdit-header{
  display: flex;
  align-items: center;
  gap: 6px;
}
.form-sub-title{
  font-size: 16px;
  margin-bottom: 20px;
}
</style>