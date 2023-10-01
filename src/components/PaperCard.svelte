<script>
    export let imageSrc = '';
    export let title = '';
    // weblink creates a separate link that explains the paper
    export let webLink = '';
    // paper link is just a link to the project
    export let paperLink = '';
    // a paragraph explaining the content of the paper (could be the abstract)
    export let summary = '';
</script>


<div class="paper-card">
<div class="image">
    <img src={imageSrc} alt={title} />
</div>
<div class="info">
    <h4>{title}</h4>
    <p>
      {#if webLink != ''}
        <a href={webLink} target="_blank" rel="noopener noreferrer">Website</a>
      {/if}

      {#if webLink != '' && webLink != ''}
        |
      {/if}
      {#if paperLink != ''}
        <a href={paperLink} target="_blank" rel="noopener noreferrer">Paper</a>
      {/if}
    </p>
    <p><span class="text-danger">Summary: </span> {summary}</p>
</div>
</div>
  
  <style>
    /* Add your CSS styles for the PaperCard component here */
    .paper-card {
      display: flex;
      margin: 20px;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
    }
  
    .image {
      flex: 1;
      max-height: 300px;
    }
  
    .image img {
      max-width: 100%;
      height: auto;
    }
  
    .info {
      flex: 3;
      padding-left: 20px;
    }
  
    h4 {
      font-size: 1.0rem;
      margin-top: 0;
    }
  
    a {
      text-decoration: none;
      color: #0070f3;  /* Link color can be customized */
    }

    /* Media query for narrow screens (e.g., mobile) */
  @media (max-width: 768px) {
    .paper-card {
      flex-direction: column; /* Stack elements vertically */
    }

    .image {
      flex: -1; /* Move image to the top */
      margin-bottom: 10px; /* Add space between image and content */
    }

    .info {
      padding-left: 0; /* Reset padding for content */
    }
  }
  </style>
  