<script lang="ts">
	import { SettingsSidebar } from "$lib/shared/ui/layouts";
</script>

<div class="flex flex-col md:flex-row gap-6 p-6 max-w-7xl">
	<!-- Левая панель: Навигация -->
	<div class="w-full md:w-1/4">
		<SettingsSidebar />
	</div>

	<!-- Правая часть: Динамический контент -->
	<div class="flex-1 bg-base-100 rounded-lg shadow-md p-6">
		<slot />
	</div>
</div>
