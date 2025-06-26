const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  const PI_NETWORK_API_KEY = process.env.PI_NETWORK_API_KEY;

  if (!PI_NETWORK_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Pi Network API Key not configured." })
    };
  }

  // This is a placeholder. You'll replace this with actual Pi Network API calls.
  // For example, to initiate a payment, you'd call the Pi Network's payments API.
  try {
    // Example: Making a dummy request to a placeholder API
    const response = await fetch("https://jsonplaceholder.typicode.com/todos/1");
    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Pi Proxy Function executed successfully!", data: data })
    };
  } catch (error) {
    console.error("Error in Pi Proxy Function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to communicate with Pi Network API." })
    };
  }
};

