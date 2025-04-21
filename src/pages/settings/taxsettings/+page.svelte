<script lang="ts">
	import { goto } from "$app/navigation";
	import { CurrentUser } from "$lib/entities/user/model/modal";
    import { GlobalClient } from "$lib/shared/api";
	import { BaseButton } from "$lib/shared/ui/buttons";
	import { ChoicesField, InputField } from "$lib/shared/ui/inputs";
  
    // Типы из API (если экспортируются)
    import { UpdateTaxSettingsCommandLegalStatus, UpdateTaxSettingsCommandTaxRegime, BankDetails, TaxInformation, UpdateTaxSettingsCommand } from "flsurf-client";
  
    // Поля TaxInformation
    let countryIso = "";
    let localIdNumber = "";
    let legalStatus: UpdateTaxSettingsCommandLegalStatus = UpdateTaxSettingsCommandLegalStatus.Individual;
    let taxRegime: UpdateTaxSettingsCommandTaxRegime = UpdateTaxSettingsCommandTaxRegime.General;
    let vatRegistered = false;
    let vatNumber = "";
    let bankBic = "";
    let bankAccountNumber = "";
    let bankName = "";
  
    let message = "";
  
    async function saveTaxInfo() {
        let user = $CurrentUser; 
        if (user === undefined)
            goto("/")

        const payload: UpdateTaxSettingsCommand = new UpdateTaxSettingsCommand({
            userId: user?.id ?? "", 
            countryIso,
            localIdNumber,
            legalStatus,
            taxRegime,
            vatRegistered,
            vatNumber: vatRegistered ? vatNumber : undefined,
            bankBic: bankBic,
            bankAccountNumber: bankAccountNumber,
            bankName: bankName,
        });
  
        try {
            await GlobalClient.updateTaxInfo(user?.id ?? "", payload);
            message = "Налоговая информация обновлена";
        } catch {
            message = "Ошибка при сохранении";
        }
    }
  </script>
  
  <h3 class="text-lg font-bold mb-4">Налоговая информация</h3>
  
  <div class="grid gap-4 max-w-md">
    <InputField
      label="ISO‑код страны"
      placeholder="RU, KZ, BY…"
      bind:value={countryIso}
    />
    <InputField
      label="Налоговый номер (ИНН/ИИН/БИН)"
      placeholder="123456789012"
      bind:value={localIdNumber}
    />
  
    <ChoicesField
      label="Статус плательщика"
      bind:value={legalStatus}
      options={[
        { label: "Физ. лицо", key: "Individual" },
        { label: "ИП / ФЛП", key: "SoleProprietor" },
        { label: "Юридическое лицо", key: "Entity" },
      ]}
    />
  
    <ChoicesField
      label="Налоговый режим"
      bind:value={taxRegime}
      options={[
        { label: "ОСНО", key: "OSNO" },
        { label: "УСН 6% доход", key: "USN_Income6" },
        { label: "УСН 15% прибыль", key: "USN_Profit15" },
        { label: "Патент", key: "Patent" },
        { label: "Упрощёнка", key: "Simplified" },
        { label: "Общая система", key: "General" },
      ]}
    />
  
    <label class="flex items-center space-x-2">
      <input type="checkbox" bind:checked={vatRegistered} />
      <span>Зарегистрирован как плательщик НДС</span>
    </label>
  
    {#if vatRegistered}
      <InputField
        label="Номер плательщика НДС"
        placeholder="VAT123456"
        bind:value={vatNumber}
      />
    {/if}
  
    <h4 class="text-md font-semibold mt-4">Банковские реквизиты</h4>
    <InputField label="БИК" placeholder="044525225" bind:value={bankBic} />
    <InputField
      label="Номер счета"
      placeholder="40817810099910004312"
      bind:value={bankAccountNumber}
    />
    <InputField label="Название банка" bind:value={bankName} />
  
    <BaseButton onclick={saveTaxInfo}>Сохранить</BaseButton>
  
    {#if message}
      <p class="text-sm text-blue-600 mt-2">{message}</p>
    {/if}
  </div>
  