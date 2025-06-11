
(function patchParentPathAccess() {
  try {
    // Try to safely test if we can access parent.location
    const test = window.parent.location.pathname;
    // If no error, great — leave native behavior
  } catch (e) {
    // We're in cross-origin: override risky access
    Object.defineProperty(window.parent, 'location', {
      get: function() {
        console.warn('Cross-origin access to window.parent.location is blocked — returning dummy fallback.');
        return {
          pathname: '/unknown-parent-path' // or empty string or any safe default
        };
      },
      configurable: true
    });
  }
})();

const iframe = document.getElementById("myIframe");
iframe.onload = function () {
  iframe.contentWindow.postMessage(
    { type: "parentPath", value: window.location.pathname },
    "https://inb-uat.abc.com"
  );
};

window.addEventListener("message", (event) => {
  if (event.origin !== "https://bos.com") return;

  if (event.data.type === "parentPath") {
    const parentPath = event.data.value;
    console.log("Received parent pathname:", parentPath);
    // Use it safely here
  }
});


<IfModule mod_rewrite.c>
    RewriteEngine On
    # Serve pre-compressed .br if client supports Brotli and .br file exists
    RewriteCond %{HTTP:Accept-Encoding} br
    RewriteCond %{REQUEST_FILENAME}.br -f
    RewriteRule ^(.*)\.(js|css)$ $1.$2.br [L]
</IfModule>

<IfModule mod_mime.c>
    AddType application/javascript .js
    AddType text/css .css
    AddEncoding br .br
</IfModule>

<FilesMatch "\.(js|css)\.br$">
    Header set Content-Encoding br
    Header set Vary "Accept-Encoding"
</FilesMatch>


const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  mode: 'production',

  // other config like entry/output/etc

  plugins: [
    new CompressionPlugin({
      filename: '[path][name][ext].br',
      algorithm: 'brotliCompress',
      test: /\.(js|css)$/,
      compressionOptions: { level: 11 },
      threshold: 10240,
      minRatio: 0.8,
      deleteOriginalAssets: false,
    })
  ]
};

npm install compression-webpack-plugin --save-dev



sdk-api-test/
├── src/main/java/
│   └── com.example.sdk/
│       ├── config/
│       │   └── WebDriverConfig.java
│       ├── steps/
│       │   └── CommonSteps.java
│       ├── util/
│       │   └── JsonDataReader.java
│       └── runner/
│           └── TestRunner.java
├── src/test/resources/
│   ├── features/
│   │   └── common-api.feature
│   └── testdata/
│       └── login.json
└── pom.xml

common-api.feature

Feature: Common API Testing

  Scenario Outline: Validate login API
    Given I load test data from "<testDataFile>"
    When I send request to "<endpoint>"
    Then I should receive a "<statusCode>" response

  Examples:
    | testDataFile | endpoint      | statusCode |
    | login.json   | /api/login    | 200       |

    
⸻

📄 JsonDataReader.java
public class JsonDataReader {
    public static JsonNode loadTestData(String filename) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        InputStream input = new ClassPathResource("testdata/" + filename).getInputStream();
        return mapper.readTree(input);
    }
}

CommonSteps.java
public class CommonSteps {

    private JsonNode testData;
    private Response response;

    @Given("I load test data from {string}")
    public void loadTestData(String file) throws Exception {
        testData = JsonDataReader.loadTestData(file);
    }

    @When("I send request to {string}")
    public void sendRequest(String endpoint) {
        String body = testData.get("body").toString();
        response = RestAssured.given()
            .contentType("application/json")
            .body(body)
            .post(endpoint);
    }

    @Then("I should receive a {string} response")
    public void validateStatusCode(String expectedCode) {
        assertEquals(Integer.parseInt(expectedCode), response.getStatusCode());
    }
}


🧪 login.json

{
  "body": {
    "username": "testuser",
    "password": "pass123"
  }
}

TestRunner.java

@RunWith(Cucumber.class)
@CucumberOptions(
    features = "src/test/resources/features",
    glue = "com.example.sdk.steps",
    plugin = {"pretty", "html:target/cucumber-report"}
)
public class TestRunner {
}
public class JsonDataReader {
    public static JsonNode loadTestData(String fileName) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        InputStream is = new FileInputStream("src/test/resources/testdata/" + fileName);
        return mapper.readTree(is);
    }




    public static JsonNode toJsonNode(String json) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        return mapper.readTree(json);
    }
}


import com.fasterxml.jackson.databind.JsonNode;
import io.restassured.RestAssured;
import io.restassured.response.Response;

import static org.junit.Assert.*;

public class CommonSteps {

    private JsonNode currentTestCase;
    private Response response;

    @Given("I load test case {string} from {string}")
    public void loadTestCaseByIndex(String indexStr, String file) throws Exception {
        int index = Integer.parseInt(indexStr);
        JsonNode root = JsonDataReader.loadTestData(file);
        currentTestCase = root.get("testCases").get(index);
    }

    @When("I send request to {string}")
    public void sendRequest(String endpoint) {
        JsonNode bodyNode = currentTestCase.get("body");
        response = RestAssured
            .given()
            .contentType("application/json")
            .body(bodyNode.toString())
            .post(endpoint);
    }

    @Then("I should receive expected response")
    public void validateExpectedResponse() {
        int expectedStatus = currentTestCase.get("expectedStatus").asInt();
        assertEquals("Unexpected status code", expectedStatus, response.getStatusCode());

        JsonNode expectedResponse = currentTestCase.get("expectedResponse");
        if (expectedResponse != null) {
            JsonNode actual = JsonDataReader.toJsonNode(response.getBody().asString());

            // Validate that expected fields are present and match
            expectedResponse.fields().forEachRemaining(field -> {
                String key = field.getKey();
                JsonNode expectedValue = field.getValue();
                JsonNode actualValue = actual.get(key);
                assertNotNull("Missing field in response: " + key, actualValue);
                assertEquals("Mismatch in field: " + key, expectedValue.asText(), actualValue.asText());
            });
        }
    }
}


Feature: Login API tests

  Scenario Outline: Login API test - <caseDesc>
    Given I load test case "<caseIndex>" from "<testDataFile>"
    When I send request to "<endpoint>"
    Then I should receive expected response

  Examples:
    | testDataFile | caseIndex | endpoint    | caseDesc         |
    | login.json   | 0         | /api/login  | Valid login      |
    | login.json   | 1         | /api/login  | Invalid password |



    {
  "testCases": [
    {
      "description": "Valid login",
      "body": {
        "username": "validuser",
        "password": "correctpass"
      },
      "expectedStatus": 200,
      "expectedResponse": {
        "userId": 123,
        "role": "admin",
        "token": "some_token"
      }
    },
    {
      "description": "Invalid password",
      "body": {
        "username": "validuser",
        "password": "wrongpass"
      },
      "expectedStatus": 401,
      "expectedResponse": {
        "error": "Invalid credentials"
      }
    }
  ]
}

Perfect! Let’s extend your SDK pattern to:
	1.	✅ Pass request body from JSON (already done).
	2.	✅ Call API endpoint dynamically (already done).
	3.	✅ Validate full JSON response (not just status).
	4.	✅ Validate specific fields or schema if needed.







    
