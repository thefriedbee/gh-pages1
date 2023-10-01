<script>
    import {createEventDispatcher, onMount} from "svelte";

    const dispatch = createEventDispatcher();

    export let items;
    export let activeItem;
    export let languages;
    export let activeLang;
    let isMobile = false; // To track if the navigation should be in mobile mode

    // Function to check if the viewport is in mobile mode
    function checkMobile() {
        isMobile = window.innerWidth <= 768; // Adjust the breakpoint as needed
    }

    // Initialize isMobile on component mount
    onMount(() => {
        checkMobile();
        window.addEventListener('resize', checkMobile);
    });
</script>

<header>
    <nav class="navbar bg-dark navbar-dark fixed-top navbar-expand-md">

        <!-- <a class="navbar-brand" href="#"></a>-->
        <span class="fs-6 navbar-brand">Diyi Liu</span>

        <!--dual language support-->
        <div class="justify-content-start">
            <ul class="nav navbar-nav flex-row">
                <span class="text-light nav-item">Language:</span>
                {#each languages as lang}
                    <li class="nav-item nav-item-lang" on:click={() => dispatch('langChange', lang)}>
                        <a class="nav-link" class:active={lang === activeLang}
                        aria-current="page">{lang}</a>
                    </li>
                {/each}
            </ul>
        </div>

        <!-- Toggle button for mobile -->
        <button class="navbar-toggler" type="button" 
            data-bs-toggle="collapse" data-bs-target="#navbarNav"
            aria-controls="navbarNav" aria-expanded="false">
            <span class="text-light menu-text">Menu</span>
            <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="collapse navbar-collapse justify-content-end" id="navbarNav">
            <ul class="navbar-nav">
                {#each items as item}
                    <li class="nav-item" on:click={() => dispatch('tabChange', item)}>
                        <a class="nav-link" href="#{item}" class:active={item === activeItem}
                        aria-current="page">{item}</a>
                    </li>
                {/each}
            </ul>
        </div>
    </nav>
</header>

<style>
    .fs-6, .nav-item {
        margin: 0px 10px;
    }

    .nav-item-lang {
        margin: 0px 5px;
        flex-direction: row;
    }

    nav.navbar {
        max-width: 1080px;
        margin: auto auto;
    }

    span.nav-item {
        margin: auto auto;
        margin-left: 30px;
    }

    span.menu-text {
        font-size: 1rem;
    }
</style>