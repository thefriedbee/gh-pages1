<script>
    import {createEventDispatcher} from "svelte";
    const dispatch = createEventDispatcher();

    export let items;
    export let activeItem;
</script>

<header>
    <div class="container-fluid">
		<nav class="d-flex flex-wrap py-3 mb-4 border-bottom navbar navbar-default fixed-top bg-light">
			<!-- <svg class="bi me-2" width="100" height="40"><use xlink:href="#bootstrap"/></svg> -->
            <!-- <a href="#" class="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-dark text-decoration-none"></a> -->
            <div class="d-flex justify-content-start headertitle">
                <span class="fs-4">Diyi Liu's website</span>
            </div>
            
            <ul class="nav nav-pills justify-content-end headertitle">
                {#each items as item}
                    <li class="nav-item" on:click={() => dispatch('tabChange', item)}>
                        <a href="#{item}" class="nav-link" class:active={item === activeItem}
                        aria-current="page">{item}</a>
                    </li>
                {/each}
            </ul>
		</nav>
	</div>
</header>

<style>
    .headertitle {
        margin: auto 15%;
    }
</style>