import axios from 'axios';

/**
 * Searches for news articles using Tavily Search API.
 */
export async function searchCompanyNews(companyName) {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    console.warn('TAVILY_API_KEY is not defined. Returning mock news data.');
    return getMockNews(companyName);
  }

  try {
    const response = await axios.post('https://api.tavily.com/search', {
      api_key: apiKey,
      query: `${companyName} company news latest financial developments`,
      search_depth: 'advanced',
      include_answer: false,
      max_results: 6,
    });

    if (response.data && response.data.results) {
      return response.data.results.map((item) => ({
        title: item.title,
        url: item.url,
        content: item.content,
        score: item.score,
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching from Tavily API:', error.message);
    return getMockNews(companyName);
  }
}

function getMockNews(companyName) {
  return [
    {
      title: `${companyName} reports strong quarterly earnings, beating expectations`,
      url: 'https://finance.yahoo.com',
      content: `${companyName} announced its financial results with revenues growing 12% year-over-year, driven by robust sales in its flagship segments and high adoption of its latest product offerings.`,
    },
    {
      title: `Regulatory scrutiny increases for ${companyName} and peers`,
      url: 'https://bloomberg.com',
      content: `Antitrust and regulatory agencies are looking closer at industry giants, including ${companyName}, examining market dominance practices and potential consumer data privacy policies.`,
    },
    {
      title: `Analysts adjust price targets for ${companyName} following product launch`,
      url: 'https://reuters.com',
      content: `Major wall street banks adjusted their price expectations upwards for ${companyName} after a successful showcase of their new AI-enabled software solutions.`,
    }
  ];
}
