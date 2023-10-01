<script>
  export let title = '';
  // a paragraph explaining the content of the paper (could be the abstract)
  export let bullets = [];
</script>


<div class="intro-card">
  <h4>{title}</h4>
  <ul>
    {#each bullets as bullet}
      <li>{bullet}</li>
    {/each}
  </ul>
</div>
  
<style>
  /* Add your CSS styles for the PaperCard component here */
  .intro-card {
    display: flex;
    flex-direction: column;
    margin: 20px;
    padding: 10px;
    border: 0px solid #ddd;
    border-radius: 5px;
  }

  h4 {
    font-size: 1.0rem;
    margin-top: 0;
  }

  /* Media query for narrow screens (e.g., mobile) */
  @media (max-width: 768px) {
    .intro-card {
      flex-direction: column; /* Stack elements vertically */
    }
  }
</style>
  