<script lang="ts">
	import { models, showSettings, settings, user, mobile, config } from '$lib/stores';
	import { permissions } from '$lib/stores/permissions';
	import { onMount, tick, getContext } from 'svelte';
	import { toast } from 'svelte-sonner';
	import Selector from './ModelSelector/Selector.svelte';
	import Tooltip from '../common/Tooltip.svelte';

	import { updateUserSettings } from '$lib/apis/users';
	const i18n: any = getContext('i18n');

	export let selectedModels = [''];
	export let disabled = false;

	export let showSetDefault = true;

	// WINDSURF: Function to save the current model selection as default
	const saveDefaultModel = async () => {
		// WINDSURF: Check if there are any empty models in the selection
		const hasEmptyModel = selectedModels.filter((it) => it === '');
		if (hasEmptyModel.length) {
			toast.error($i18n.t('Choose a model before saving...'));
			return;
		}
		// WINDSURF: Update the settings with the new model selection
		settings.set({ ...$settings, models: selectedModels });
		await updateUserSettings(localStorage.token, { ui: $settings });

		toast.success($i18n.t('Default model updated'));
	};

	// WINDSURF: Reactive statement to ensure model selection is valid
	$: if (selectedModels.length > 0 && $models.length > 0) {
		// WINDSURF: Map through the selected models and replace any invalid models with an empty string
		selectedModels = selectedModels.map((model) =>
			$models.map((m) => m.id).includes(model) ? model : ''
		);
	}
</script>

<!-- WINDSURF: Main model selector component that allows users to select and manage multiple models -->
<div class="flex flex-col w-full items-start">
	<!-- WINDSURF: Iterate through each selected model, creating a selector for each one -->
	{#each selectedModels as selectedModel, selectedModelIdx}
		<div class="flex w-full max-w-fit">
			<div class="overflow-hidden w-full">
				<div class="mr-1 max-w-full">
					<Selector
						id={`${selectedModelIdx}`}
						placeholder={$i18n.t('Select a model')}
						items={$models.map((model) => ({
							value: model.id,
							label: model.name,
							model: model
						}))}
						showTemporaryChatControl={$user?.role === 'user'
							? ($user?.permissions?.chat?.temporary ?? true)
							: true}
						bind:value={selectedModel}
					/>
				</div>
			</div>

			<!-- WINDSURF: For the first model (index 0), show the "+" button to allow adding more models -->
			{#if selectedModelIdx === 0 && $permissions.canAccessModels}
				<div class="self-center mx-1 disabled:text-gray-600 disabled:hover:text-gray-600 -translate-y-[0.5px]">
					<Tooltip content={$i18n.t('Add Model')}>
						<!-- WINDSURF: When clicked, spread the existing models array and append an empty string 
							This creates a new model selector with an empty selection -->
						<button
							class=" "
							{disabled}
							on:click={() => {
								selectedModels = [...selectedModels, ''];
							}}
							aria-label="Add Model"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="2"
								stroke="currentColor"
								class="size-3.5"
							>
								<path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m6-6H6" />
							</svg>
						</button>
					</Tooltip>
				</div>
			{:else if selectedModelIdx !== 0 && $permissions.canAccessModels}
				<div class="self-center mx-1 disabled:text-gray-600 disabled:hover:text-gray-600 -translate-y-[0.5px]">
					<Tooltip content={$i18n.t('Remove Model')}>
						<!-- WINDSURF: When clicked, remove this model from the array using splice
							Then reassign the array to trigger Svelte's reactivity -->
						<button
							class=" "
							{disabled}
							on:click={() => {
								selectedModels.splice(selectedModelIdx, 1);
								selectedModels = selectedModels;
							}}
							aria-label="Remove Model"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="2"
								stroke="currentColor"
								class="size-3.5"
							>
								<path stroke-linecap="round" stroke-linejoin="round" d="M18 12H6" />
							</svg>
						</button>
					</Tooltip>
				</div>
			{/if}
		</div>
	{/each}
</div>

<!-- WINDSURF: Optional UI element to save the current model selection as default -->
{#if showSetDefault}
	<div class="absolute text-left mt-[1px] ml-1 text-[0.7rem] text-gray-500 font-primary">
		<button on:click={saveDefaultModel}> {$i18n.t('Set as default')}</button>
	</div>
{/if}
