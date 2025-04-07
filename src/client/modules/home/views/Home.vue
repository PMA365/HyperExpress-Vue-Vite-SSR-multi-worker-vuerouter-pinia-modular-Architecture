<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useHomeStore } from "../store/homeStore";

const count = ref(0);
const msg = ref("Hello Vue!");
const homeStore = useHomeStore();

// Ensure data is loaded the same way on both server and client
onMounted(() => {
	// Only fetch on client-side if not already loaded
	if (homeStore.items.length === 0) {
		homeStore.fetchItems();
	}
});
</script>

<template>
	<h1>{{ msg }}</h1>
	<div>{{ homeStore.title }}</div>

	<div class="card">
		<button type="button" @click="count++">count is {{ count }}</button>
		<p>
			Edit
			<code>components/HelloWorld.vue</code> to test HMR
		</p>
	</div>

	<div v-if="homeStore.items.length > 0">
		<h2>Items ({{ homeStore.itemCount }})</h2>
		<ul>
			<li v-for="(item, index) in homeStore.items" :key="index">{{ item }}</li>
		</ul>
	</div>

	<p>
		Check out
		<a href="https://vuejs.org/guide/quick-start.html#local" target="_blank"
			>create-vue</a
		>, the official Vue + Vite starter
	</p>
	<p>
		Install
		<a href="https://github.com/johnsoncodehk/volar" target="_blank">Volar</a>
		in your IDE for a better DX
	</p>
	<p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
</template>

<style scoped>
.read-the-docs {
	color: #888;
}
</style>
