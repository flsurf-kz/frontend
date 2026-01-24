<script lang="ts">
  import {
    LinkedInIcon,
    XIcon, // Assuming X (Twitter)
    YouTubeIcon,
    InstagramIcon,
    // AppleIcon, // Removed
    // AndroidIcon, // Removed
    FacebookIcon
  } from "$lib/shared/ui/icons"; // Убедитесь, что путь к иконкам корректный

  // Обновленные ссылки с русскими названиями и правильными путями
  const companyLinks = [ // Переименовано из brandLinks для ясности
    { title: "О нас", url: "/unauth/about" },
    { title: "Обратная связь", url: "/unauth/feedback" },
    { title: "Доверие и Безопасность", url: "/unauth/trust-safety-security" }
  ];

  const helpLinks = [
    { title: "Помощь и Поддержка", url: "/unauth/help-support" },
    { title: "Условия обслуживания", url: "/unauth/terms-of-service" },
    { title: "Политика конфиденциальности", url: "/unauth/privacy-policy" }
  ];

  const legalLinks = [ // Переименовано из docsLinks
    { title: "Уведомление CA при сборе данных", url: "/unauth/ca-notice-at-collection" },
    { title: "Настройки Cookie", url: "/unauth/cookie-settings" },
    { title: "Политика Cookie", url: "/unauth/cookie-policy" },
    { title: "Лицензионное соглашение", url: "/unauth/license" } // Добавлена ссылка на лицензию
  ];

  const currentYear = new Date().getFullYear();
</script>

<footer class="footer p-10 text-neutral-content flex justify-between bg-gray-900"> 
  <div>
    <span class="footer-title opacity-100">flsurf.kz</span> 
    {#each companyLinks as link}
      <a href={link.url} class="link link-hover">{link.title}</a>
    {/each}
    <p class="mt-4 text-sm opacity-70">© 2025 - {currentYear} flsurf.kz</p> 
  </div> 

  <div>
    <span class="footer-title opacity-100">Помощь</span> 
    {#each helpLinks as link}
      <a href={link.url} class="link link-hover">{link.title}</a>
    {/each}
  </div> 

  <div>
    <span class="footer-title opacity-100">Документы</span> 
    {#each legalLinks as link}
      <a href={link.url} class="link link-hover">{link.title}</a>
    {/each}
  </div> 

  <div>
    <span class="footer-title opacity-100">Мы в соцсетях</span> 
    <div class="grid grid-flow-col gap-4 mt-2">
      <a href="https://youtube.com" class="hover:opacity-80 transition-opacity" aria-label="YouTube FLSURF.KZ">
        <YouTubeIcon width="24" height="24" />
      </a>
      <a href="https://instagram.com" class="hover:opacity-80 transition-opacity" aria-label="Instagram FLSURF.KZ">
        <InstagramIcon width="24" height="24" />
      </a>
    </div>
    </div>
</footer>