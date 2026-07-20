<template>
  <div class="page-card">
    <div class="mb-8 animate-item" :style="{ '--item-index': 1 }">
      <h2 class="text-[30px] font-bold text-slate-800 tracking-tight mb-2">
        登录
      </h2>
      <p class="text-[15px] text-slate-500">输入您的账户信息</p>
    </div>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      @submit.prevent="handleLogin"
    >
      <div class="animate-item" :style="{ '--item-index': 2 }">
        <el-form-item
          required
          prop="email"
          label-width="auto"
          label-position="top"
        >
          <template #label>
            <span class="text-sm font-medium text-slate-800">邮箱地址</span>
          </template>
          <el-input
            v-model="form.email"
            placeholder="name@example.com"
            size="large"
          />
        </el-form-item>
      </div>
      <div class="animate-item" :style="{ '--item-index': 3 }">
        <el-form-item prop="password" label-width="auto" label-position="top">
          <template #label>
            <span class="text-sm font-medium text-slate-800">密码</span>
          </template>
          <el-input
            v-model="form.password"
            type="password"
            placeholder="••••••••"
            size="large"
            show-password
          />
        </el-form-item>
      </div>

      <div
        class="flex justify-between items-center mt-1 mb-6 animate-item"
        :style="{ '--item-index': 4 }"
      >
        <el-checkbox v-model="rememberMe">
          <span class="text-sm text-slate-500">记住此设备</span>
        </el-checkbox>
        <a
          href="#"
          class="text-sm text-indigo-500 font-medium hover:text-indigo-600 no-underline"
          >忘记密码？</a
        >
      </div>

      <el-button
        type="primary"
        size="large"
        :loading="loading"
        class="w-full !h-12 !text-[15px] !font-semibold !tracking-widest animate-item"
        :style="{ '--item-index': 5 }"
        @click="handleLogin"
      >
        登 录
      </el-button>
    </el-form>

    <div
      class="text-center mt-7 text-sm text-slate-500 animate-item"
      :style="{ '--item-index': 6 }"
    >
      还没有账户？
      <NuxtLink
        to="/register"
        class="text-indigo-500 font-medium hover:text-indigo-600 no-underline"
      >
        创建账户
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from "element-plus";

const formRef = ref<FormInstance>();
const loading = ref(false);
const rememberMe = ref(false);

const form = reactive({
  client_id: "",
  redirect_uri: "",
  email: "",
  password: "",
});

const rules: FormRules = {
  email: [
    { required: true, message: "请输入邮箱地址", trigger: "blur" },
    { type: "email", message: "请输入有效的邮箱地址", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, message: "密码至少6个字符", trigger: "blur" },
  ],
};

/**
 * @description: 获取重定向路径，处理绝对路径和相对路径
 * @param redirectParam 重定向参数
 * @returns 处理后的重定向路径
 */
function getRedirectPath(redirectParam: string | undefined): string {
  if (!redirectParam) return "/";

  try {
    if (
      redirectParam.startsWith("http://") ||
      redirectParam.startsWith("https://")
    ) {
      const url = new URL(redirectParam);
      return url.pathname + url.search;
    }
    if (redirectParam.startsWith("/")) {
      return redirectParam;
    }
    return "/" + redirectParam;
  } catch {
    return "/";
  }
}

const handleLogin = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      form.client_id = "business-a";
      form.redirect_uri = "http://localhost:3000/CallBack";

      try {
        const res = await $fetch("/api/auth/login", {
          method: "POST",
          body: form,
        });

        const redirect = useRoute().query.redirect; // 从路由参数中获取 redirect 查询参数
        console.log("登录:", res, redirect);

        const baseUrl = "http://localhost:3000";
        const redirectPath = getRedirectPath(redirect as string);
        const code = res?.data?.code;

        const url = new URL("/CallBack", baseUrl);
        url.searchParams.set("code", code || "");
        url.searchParams.set("redirect", redirectPath || "");

        console.log("跳转目标:", url.toString());
        window.location.href = url.toString();
      } catch (error: any) {
        console.error("登录失败:", error);
        ElMessage.error(error?.response?._data?.msg || "登录失败，请重试");
      } finally {
        loading.value = false;
      }
    }
  });
};

// ----- 入场动画 -----
onMounted(() => {
  const items = document.querySelectorAll(".animate-item");
  items.forEach((item) => {
    // 添加入场动画类
    item.classList.add("item-enter-active");
  });
});

// 推荐使用 Vue Router 的 onBeforeRouteLeave（需要导入）
import { onBeforeRouteLeave } from "vue-router";

/**
 * 拦截路由离开前的动画：离场动画
 */
onBeforeRouteLeave((to, from, next) => {
  next();
});
</script>

<style scoped lang="scss">
/* 隐藏 el-form-item 必填星号 */
:deep(.el-form-item__label::before) {
  display: none;
}

/* ========== 表单项 动画：入场 ========== */
@keyframes fadeSlideUp {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  60% {
    opacity: 1;
    transform: translateY(-5px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 入场动画：入场延迟 */
.item-enter-active {
  animation: fadeSlideUp 0.3s ease forwards;
  opacity: 0; /* 初始透明，动画结束后变为1 */
}
.item-leave-active {
  animation: fadeSlideDown 0.3s ease forwards;
}
/* 使用 SCSS 循环生成入场延迟 (1~6) */
@for $i from 1 through 6 {
  .animate-item[style*="--item-index: #{$i}"] {
    animation-delay: $i * 100ms;
  }
  .animate-item[style*="--item-index: #{$i}"] {
    animation-delay: $i * 100ms;
  }
}
</style>
