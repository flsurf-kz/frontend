<script lang="ts">
	import { InputField, TextField } from '$lib/shared/ui/inputs';
	import { BaseButton } from '$lib/shared/ui/buttons';
	import { SelectorTaggableSearch } from '$lib/shared/ui/selector';
	import { GlobalClient } from '$lib/shared/api';
	import { AddPortfolioProjectCommand, CreateFileDto, FreelancerProfileEntity, SkillEntity } from 'flsurf-client';
	import type { SelectItem } from '$lib/shared/types';
	import { showError } from '$lib/shared/ui/errors';

	FreelancerProfileEntity
	let form = $state({
		title: '',
		role: '',
		description: '',
		selectedSkills: [] as { key: string; label: string }[],
		searchResults: [] as { key: string; label: string }[],
		files: [] as File[]
	});

	let maxSkills = 5;

	async function handleSearchSkills(query: string) {
		const skills = await GlobalClient.getSkills(query);
		form.searchResults = skills.map(s => ({
			key: s.id ?? '',
			label: s.name ?? ''
		}));
	}

	function addSkill(skill: SelectItem) {
		if (form.selectedSkills.length < maxSkills && !form.selectedSkills.find(s => s.key === skill.key)) {
			form.selectedSkills.push(skill);
		}
	}

	function removeSkill(index: number) {
		form.selectedSkills.splice(index, 1);
	}

	function handleFileUpload(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		if (input?.files?.length) {
			form.files = Array.from(input.files);
		}
	}

	async function handleSave() {
		try {
			// Преобразуем файлы
			const fileDtos: CreateFileDto[] = form.files.map(f => new CreateFileDto({
				name: f.name,
				mimeType: f.type,
				stream: '', // заглушка, можно позже с real upload
			}));

			const command = new AddPortfolioProjectCommand({
				name: form.title,
				userRole: form.role,
				description: form.description,
				skills: form.selectedSkills.map(s => s.key),
				files: fileDtos
			});

			await GlobalClient.createPortfolioProject(command);
			alert('Проект успешно сохранён!');
		} catch (e) {
			showError('Ошибка при сохранении проекта');
		}
	}
</script>

<!-- svelte-ignore a11y_label_has_associated_control -->
<div class="max-w-4xl mx-auto p-6 space-y-6">
	<h1 class="text-2xl font-bold">Add a new portfolio project</h1>

	<!-- Заголовок -->
	<div>
		<label class="font-medium">Project title</label>
		<InputField bind:value={form.title} placeholder="Enter a descriptive title" maxlength={70} />
	</div>

	<!-- Ваша роль -->
	<div>
		<label class="font-medium">Ваша роль (optional)</label>
		<InputField bind:value={form.role} placeholder="e.g., Frontend Developer" maxlength={100} />
	</div>

	<!-- Описание -->
	<div>
		<label class="font-medium">Описание проекта</label>
		<TextField bind:value={form.description} rows={5} maxLength={600} placeholder="Describe what you did..." />
	</div>

	<!-- Навыки -->
	<div>
		<label class="font-medium">Skills and deliverables</label>
		<SelectorTaggableSearch
			selectedItems={form.selectedSkills}
			searchResults={form.searchResults}
			onSearch={handleSearchSkills}
			onAdd={addSkill}
			onRemove={removeSkill}
			placeholder="Type to add skills"
		/>
	</div>

	<!-- Загрузка файлов -->
	<div>
		<label class="font-medium block mb-1">Attach files (images, pdf, etc.)</label>
		<input type="file" multiple accept="image/*,.pdf" onchange={handleFileUpload} />
	</div>

	<!-- Кнопки -->
	<div class="flex justify-end mt-6 gap-2">
		<BaseButton className="success" onclick={handleSave}>Save</BaseButton>
	</div>
</div>
