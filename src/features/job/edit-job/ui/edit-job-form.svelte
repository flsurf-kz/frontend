<script lang="ts">
	import { GlobalClient } from "$lib/shared/api";
	import { EditButton } from "$lib/shared/ui/buttons";
	import BaseButton from "$lib/shared/ui/buttons/base-button.svelte";
	import { InputField, TextField } from "$lib/shared/ui/inputs";
	import { SelectorTaggableSearch } from "$lib/shared/ui/selector";
	import SelectorCategoriezed from "$lib/shared/ui/selector/selector-categoriezed.svelte";
	import { UpdateJobCommand, type CategoryEntity, type JobEntity } from "flsurf-client";

	import type { Category, SelectItem } from "$lib/shared/types";

	let { job, categories }: { job: JobEntity, categories: CategoryEntity[] } = $props();

    function convertCategories(input: CategoryEntity[]): Category[] {
    	return input.map((cat) => ({
    		key: cat.id,
    		label: cat.name ?? '',
    		items: cat.subCategories ? convertCategories(cat.subCategories) : []
    	}));
    }

	let editing = $state({
		title: false,
		description: false,
		category: false,
		skills: false,
		budget: false
	});

	let form = $state({
		title: job.title ?? '',
		description: job.description ?? '',
		categoryId: job.categoryId ?? '',
		selectedSkills: job.requiredSkills?.map(s => ({ key: s.id, label: s.name ?? '' })) ?? [],
		searchResults: [] as SelectItem[],
		budgetMin: job.payout?.amount ?? 0,
		budgetMax: job.payout?.amount ?? 0
	});

    let convertedCategories = convertCategories(categories);
        
	let searchValue = $state('');

	async function handleSearchSkills(query: string) {
		searchValue = query;
		const skills = await GlobalClient.getSkills(query);
		form.searchResults = skills.map((s) => ({
			key: s.id ?? "",
			label: s.name ?? ""
		}));
	}

	function handleAddSkill(skill: SelectItem) {
		if (!form.selectedSkills.some(s => s.key === skill.key)) {
			form.selectedSkills.push(skill);
		}
	}

	function handleRemoveSkill(index: number) {
		form.selectedSkills.splice(index, 1);
	}

	async function save(draft = false) {
		await GlobalClient.updateJob(new UpdateJobCommand({
        	jobId: job.id,
        	title: form.title,
        	description: form.description,
        	categoryId: form.categoryId,
        	requiredSkillIds: form.selectedSkills.map(s => s.key),
        	budget: form.budgetMax
        }));
	}
</script>

<div class="space-y-6 max-w-3xl mx-auto p-4">
	<h1 class="text-2xl font-bold">Редактирование заказа</h1>

	<!-- Заголовок -->
	<div class="border p-4 rounded shadow-sm">
		<div class="flex justify-between items-center">
			<h2 class="text-md font-semibold">Заголовок</h2>
			<EditButton onclick={() => editing.title = !editing.title} />
		</div>
		{#if editing.title}
			<InputField bind:value={form.title} placeholder="Введите заголовок..." />
		{:else}
			<p class="text-gray-800">{form.title}</p>
		{/if}
	</div>

	<!-- Описание -->
	<div class="border p-4 rounded shadow-sm">
		<div class="flex justify-between items-center">
			<h2 class="text-md font-semibold">Описание</h2>
			<EditButton onclick={() => editing.description = !editing.description} />
		</div>
		{#if editing.description}
			<TextField bind:value={form.description} rows={5} placeholder="Введите описание..." />
		{:else}
			<p class="text-gray-800 whitespace-pre-line">{form.description}</p>
		{/if}
	</div>

	<!-- Категория -->
	<div class="border p-4 rounded shadow-sm">
		<div class="flex justify-between items-center">
			<h2 class="text-md font-semibold">Категория</h2>
			<EditButton onclick={() => editing.category = !editing.category} />
		</div>
		{#if editing.category}
			<SelectorCategoriezed
				categories={convertedCategories}
				searchValue={searchValue}
				bind:selectedValue={form.categoryId}
			/>
		{:else}
			<p class="text-gray-800">{job.category?.name ?? 'Не выбрано'}</p>
		{/if}
	</div>

	<!-- Навыки -->
	<div class="border p-4 rounded shadow-sm">
		<div class="flex justify-between items-center">
			<h2 class="text-md font-semibold">Навыки</h2>
			<EditButton onclick={() => editing.skills = !editing.skills} />
		</div>
		{#if editing.skills}
			<SelectorTaggableSearch
				selectedItems={form.selectedSkills}
				searchResults={form.searchResults}
				onSearch={handleSearchSkills}
				onAdd={handleAddSkill}
				onRemove={handleRemoveSkill}
			/>
		{:else}
			<p class="text-gray-800">{form.selectedSkills.join(', ')}</p>
		{/if}
	</div>

	<!-- Бюджет -->
	<div class="border p-4 rounded shadow-sm">
		<div class="flex justify-between items-center">
			<h2 class="text-md font-semibold">Бюджет</h2>
			<EditButton onclick={() => editing.budget = !editing.budget} />
		</div>
		{#if editing.budget}
			<div class="flex gap-4">
				<InputField inputType="number" value={form.budgetMin} label="От" />
				<InputField inputType="number" value={form.budgetMax} label="До" />
			</div>
		{:else}
			<p class="text-gray-800">{form.budgetMin} – {form.budgetMax} {job.payout?.currency}</p>
		{/if}
	</div>

	<!-- Действия -->
	<div class="flex justify-between items-center mt-6">
		<BaseButton className="gray" onclick={() => save(true)}>Сохранить как черновик</BaseButton>
		<BaseButton className="success" onclick={() => save(false)}>Опубликовать</BaseButton>
	</div>
</div>
