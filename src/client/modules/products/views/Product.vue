<script setup lang="ts">
import HelloWorld from "../components/HelloWorld.vue";
import { onMounted } from "vue";
console.log("Product.vue: setup");

onMounted(() => {
	console.log("Product.vue: mounted");
});
</script>

<template>
	<h1>Product view</h1>
	<HelloWorld msg="Vite + Vue" />
</template>
