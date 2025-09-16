import { type SowCheck } from './sow-data';

const LOCAL_STORAGE_KEY = 'sowise_default_checks';

const initialChecks: SowCheck[] = [
  // Original check for duplicate headings - covers a specific type of duplication.
  {
    id: 'check1',
    title: 'Duplicate Headings Check',
    prompt:`You are an expert document structure analyst. Your primary task is to **rigorously identify ONLY genuine hierarchical headings** from the provided raw text content of a DOCX file. After this strict identification, you will then check *only these identified headings* for duplicates.

      **Step 1: STRICT IDENTIFICATION OF GENUINE HEADINGS (Infer from Textual Cues ONLY)**
      Carefully scan the entire document content to find text that *unambiguously* functions as a hierarchical heading. Apply these **absolute and strict criteria**:

      1.  **Standalone Line & Isolation:** A heading *must* be on its own line. It should be clearly isolated, typically preceded and followed by blank lines or significant line breaks, indicating a new section begins. It cannot be part of a continuous paragraph.
      2.  **Topical Introduction:** Its sole purpose must be to introduce a new major section, sub-section, or distinct topic within the document's structure.
      3.  **Conciseness & Prominence (Inferred - Strictly Enforced):** Headings are generally short, impactful phrases or sentences.
          * **Word Count Limit:** The heading text (excluding any numerical/alphabetical prefixes) **must NOT exceed 10 words**. Any line over 10 words is highly unlikely to be a heading.
          * **Inferred Emphasis:** Look for implied prominence such as:
              * **Capitalization:** Often entirely uppercase or Title Case (e.g., "INTRODUCTION", "Chapter One: The Beginning").
              * **Numerical/Alphabetical Prefixes:** Common for structured documents (e.g., "1. Executive Summary", "2.1 Project Scope", "A. Appendix"). These prefixes *are part of the heading* for identification, but the 10-word count applies to the main text part.
              * **Consistent Indentation/Structure:** A pattern of leading spaces before the heading text, suggesting a list-like or hierarchical structure.

      **CRITICAL EXCLUSIONS (You MUST ignore and NOT include these as headings, even if they appear prominent or visually distinct):**
      * **ANY Inline Text/Paragraph Elements:** Absolutely **DO NOT** include any text that is part of a continuous paragraph, even if it's bolded, italicized, underlined, or capitalized *within* that paragraph for emphasis. Headings are separate, distinct lines.
      * **Bullet Points / List Items (Strict Exclusion):** **DO NOT** include standard bulleted list items (e.g., lines starting with '-', '*', '•') or numbered list items (e.g., '1.', '2.', 'a.', 'b.') unless they are *unquestionably* introducing a major document section and follow ALL other heading criteria (especially the 10-word limit and isolation). The default assumption is that these are list items, not headings.
      * **Table Content (Absolute Exclusion):** **STRICTLY EXCLUDE** any and all text that clearly belongs to a table structure (e.g., column headers, row data, table captions, cells).
      * **Figure / Chart / Image Captions:** Text explicitly labeled as a caption for a figure, table, chart, or image.
      * **Page Headers / Footers:** Any recurring text that appears at the top or bottom of pages (e.g., page numbers, running titles, document versioning in headers/footers).
      * **Short, Non-Descriptive Lines / Labels:** Single words or very short phrases (even if isolated) that do not introduce a significant section (e.g., "Note:", "Important:", "Summary:", "Figure 1:", "Table 2:", "Disclaimer:"). These are labels, not hierarchical headings.
      * **Contact Information / Addresses / Footnotes / Citations:** Any lines that appear to be contact details, addresses, footnotes, or bibliography entries.
      
      NOTE :- The heading text (excluding any numerical/alphabetical prefixes) **must NOT exceed 10 words**.
      **Step 2: Perform Duplicate Analysis on IDENTIFIED HEADINGS ONLY**
      Once you have created the definitive list of genuine headings based on the **STRICT** criteria and **CRITICAL EXCLUSIONS**, proceed with the following:

      * **List Identified Headings:** First, present a clear, numbered list of all the "real" headings you have identified.
      * **Duplicate Check & Verification:** Then, perform the duplicate analysis. If duplicate headings (exact text match, case-sensitive) are found in your *identified list*, list each unique duplicate heading and its total count. **Before providing the final count, re-verify each listed duplicate heading against your strict identification criteria to ensure it was correctly identified as a heading.**
      * **No Duplicates:** If no duplicate headings are found in your identified list, state clearly: "All identified headings are unique."
`
  },
  // Original check for title format.
  {
    id: 'check2',
    title: 'Title Format Check',
    prompt:`You are an expert document structure analyst. Your task is to identify the main title of the document and verify its format, checking both the provided filename and the document's content.
      **Step 1: Identify the Main Document Title (Prioritize Filename)**
      **A. Check the provided Filename first:**
      Examine the 'Provided Filename' string for the main document title format. If the filename itself appears to be the main document title (e.g., "SOW CustomerName - ProjectName.docx"), prioritize this.

      **B. If not found in Filename, infer from Document Content:**
      If the main title format is not clearly present in the filename, then infer the main title from the 'Document Content'. Locate the most prominent, top-level text that appears at the very beginning of the document's content. This is typically a single line or short phrase that introduces the entire document. Look for:
      * The first line of text that appears to be a major heading or title.
      * Text that stands out due to its position (very top), implied larger font (e.g., all caps, very few words on a line), or common title-like formatting.
  
      **CRITICAL EXCLUSIONS for Title Identification (when inferring from content):**
      * Do NOT consider any text that is part of a regular paragraph.
      * Do NOT consider any text found within tables, headers, or footers (infer these based on context if present in the provided content).
      * Do NOT consider any text that is clearly a sub-heading or section title rather than the overall document title.
    
      **Step 2: Check the Identified Main Title Format**
      Once you have identified what you infer to be the main document title (either from the filename or the document content), check if it **exactly** follows the format:
      *"SOW [Customer] - [Project]"*

      Where:
      * "SOW" is the literal string "SOW" (case-sensitive).
      * "[Customer]" represents any sequence of words for the customer name.
      * "-" is a literal hyphen character.
      * "[Project]" represents any sequence of words for the project name.
      * There are single spaces exactly as shown around the hyphen and after "SOW".

      **Output Format:**
      Based on your analysis:
      * If the identified main title (from either filename or document content) strictly matches the "SOW [Customer] - [Project]" format, respond with: "Yes, the title format is correct."
      * If the identified main title does NOT strictly match this format (even if it's close or has minor variations), respond with: "No, the title format is incorrect."
`,
  },
  // Original language check.
  {
    id: 'check3',
    title: 'Language Check (English Only)',
    prompt :`You are a highly skilled language detection AI. Your task is to meticulously analyze the entire provided document content to determine if it contains *any* non-English words, phrases, or sentences.
      **Instructions for Language Detection:**
      1.  **Comprehensive Scan:** Go through the entire document content from start to finish.
      2.  **Granular Detection:** Identify individual words, short phrases, or entire sentences that are clearly not in the English language. This includes:
        * Text in non-Latin scripts (e.g., Arabic, Chinese, Devanagari).
        * Words with diacritics specific to other languages (e.g., "ñ", "ç", "ü", "é") when not commonly used in English loanwords.
        * Words or phrases that are clearly from another language and not common English loanwords or proper nouns.
        * Full sentences written entirely in a non-English language.
      3.  **Exclusions for Non-English Snipet Listing (but still detect for overall check):** Do not list common foreign proper nouns (e.g., names of cities, people, well-known brands) or very common English loanwords (e.g., "rendezvous", "kindergarten") as "non-English snippets" unless they are part of a clearly non-English sentence. However, *still detect them* for the overall "English Only" determination. The goal is to catch substantial foreign language content.

      **Output Format:**
      * If **any substantial non-English text** (words, phrases, or sentences, excluding common proper nouns/loanwords unless they form a non-English phrase) is detected anywhere in the document, respond with:
        "No,"
        followed by a list of each identified non-English snippet.
      * If the document appears to contain **only English text** (and acceptable loanwords/proper nouns in English context), respond with: "Yes"
`,
  },
  // Original Role Breakdown check.
  {
    id: 'check4',
    title: 'Role Breakdown Table Check',
    prompt:`You are an expert document structure analyst. Your task is to accurately determine the presence of a "Role Breakdown" section or table within the provided document content.
      **Instructions for Identification:**
      1.  **Primary Identification (Heading/Label):** Search for a section or table that is explicitly introduced or clearly labeled as "Proposed Engagement Staffing or Role Breakdown". This might appear as:
        * A direct heading such as "Proposed Engagement Staffing", "Roles and Responsibilities Breakdown", "Roles", or similar clear variations.
      2.  **Content Clues (Within the section/table):** If such a label is found, confirm its nature by looking for content typically associated with role breakdowns, such as:
        * Listings of different roles (e.g., "Project Manager", "Developer", "QA Engineer").
        * Descriptions of responsibilities associated with those roles.
        * Columns or entries pertaining to "Role", "Description", "Responsibility", "Effort", etc.

      **CRITICAL EXCLUSIONS:**
      * **Do NOT** confuse general tables that discuss roles (e.g., an organization chart, a contact list) with a dedicated "Role Breakdown" section/table unless it's explicitly labeled as such.
      * **Do NOT** consider mere mentions of "roles" within standard paragraphs or other sections that are not clearly part of a structured "Role Breakdown" section or table.
      * **Do NOT** include a heading that just *contains* the words "role" or "breakdown" if it's not the clear, intended "Role Breakdown" section (e.g., "Our Role in the Project" is not a "Role Breakdown" table).

      **Output Format:**
      * If you find a section or table that clearly meets the criteria for "Role Breakdown", respond with: "Yes, a 'Role Breakdown' section or table is found."
      * If, after a thorough analysis, no such explicitly labeled or clearly identifiable "Role Breakdown" section or table exists according to the criteria, respond with: "No, no 'Role Breakdown' section or table exists."
`,
  },
  // Original Fees Breakdown check.
  {
    id: 'check5',
    title: 'Fees Breakdown Table Validation',
    prompt: `You are an expert document structure analyst. Your task is to locate and validate a "Fees Breakdown" section or table within the provided document content.
      **Step 1: Identify the "Fees Breakdown" Section or Table**
      Search for a section or table that is explicitly labeled or clearly identifiable as "Fees Breakdown". Look for the following textual cues:
      * **Heading:** A prominent heading containing the word "Fees" (e.g., "Fees", "Fees Schedule", "Project Fees"). This heading should appear as a major section title (inferred by being on its own line, often with preceding/succeeding blank lines, and appearing as a primary section introducer).
      * **Table Caption/First Cell:** A table where the caption or the text in the very first cell clearly states "Fees Breakdown", "Amount", "Pricing", or similar explicit "fees or amounts" related terms at the beginning of a table.

      **CRITICAL EXCLUSIONS for "Fees Breakdown" Identification:**
      * Do NOT consider any text or tables that merely *mention* fees in a general paragraph or in other sections not clearly dedicated to a breakdown (e.g., "Our fees are competitive").
      * Do NOT include tables that contain "fees" but are clearly for other purposes (e.g., a list of client contacts that happens to include a "Fee" column for internal use, but isn't the primary "Fees Breakdown").

      **Step 2: If "Fees Breakdown" is Found, Validate Conditions**
      If you have successfully identified a "Fees Breakdown" section or table, proceed to check the following two conditions based on its content:

      **Condition 1: Organization by Milestones, NOT Deliverables**
      * Examine how the fees are structured or itemized within the breakdown.
      * Determine if the fee items are clearly tied to **project milestones** (e.g., "Milestone 1 Completion Fee", "Phase 2 Payment") rather than individual **deliverables** (e.g., "Report A Development", "Feature B Implementation").

      **Condition 2: Milestone Totals Match Overall Fees**
      * Look for sub-totals associated with milestones and an overall "Total Fees" or "Grand Total" for the entire project.
      * Verify if the sum of all identified milestone-related fees (or fee amounts explicitly broken down by milestone) equals the stated overall total fees for the document. If an exact match is not possible to verify due to complex calculations, assess if they appear consistent.

      **Output Format:**
      * If **NO** "Fees Breakdown" section or table is found (after applying Step 1's criteria), respond with:
          "No Fees Breakdown section or table exists in the document."
      * If a "Fees Breakdown" section or table **IS** found:
          * If **BOTH Condition 1 AND Condition 2 are met**, respond with:
              "Yes, all Fees Breakdown requirements are met."
          * If **ANY of the conditions fail**, respond with:
              "No, and include specific reasons."
              For example:
              "No, Condition 1 failed – fees are based on deliverables, not milestones."
              "No, Condition 2 failed – milestone totals do not clearly match the overall fees."
              "No, Condition 1 failed – fees are based on deliverables, not milestones. Condition 2 failed – milestone totals do not clearly match the overall fees."
`,
  },
  // Original check for customer name usage in a FINALIZED document.
  {
    id: 'check6',
    title: 'Customer Name Usage Check',
    prompt:`You are an expert document structure analyst. Your primary task is to identify and then accurately count the occurrences of the customer name within the provided document content.
      **Step 1: Identify the Customer Name**
      First, locate the most prominent, top-level text that appears at the very beginning of the document's content. This is typically a single line or short phrase that introduces the entire document. Look for:
      * The first line of text that appears to be a major heading or title.
      * Text that stands out due to its position (very top), implied larger font (e.g., all caps, very few words on a line), or common title-like formatting.
  
      **CRITICAL EXCLUSIONS for Title Identification (when inferring from content):**
      * Do NOT consider any text that is part of a regular paragraph.
      * Do NOT consider any text found within tables, headers, or footers (infer these based on context if present in the provided content).
      * Do NOT consider any text that is clearly a sub-heading or section title rather than the overall document title.
    
      **Check the Identified Main Title Format**
      Once you have identified what you infer to be the main document title (either from the filename or the document content), check if it **exactly** follows the format:
      *"SOW [Customer] - [Project]"*

      Where:
      * "SOW" is the literal string "SOW" (case-sensitive).
      * "[Customer]" represents any sequence of words for the customer name.
      * "-" is a literal hyphen character.
      * "[Project]" represents any sequence of words for the project name.
      * There are single spaces exactly as shown around the hyphen and after "SOW".
      From this inferred document title, extract the exact text that appears between "SOW " and the first " - " ([Customer]). This extracted text is your "Customer Name".
      **Step 2: Count Occurrences of the Customer Name**
      Once the "Customer Name" is identified, search the entire provided document content for every instance of this exact customer name.

      **CRITICAL RULES FOR COUNTING:**
      1.  **Exact Match Only:** Count only occurrences that are an exact, case-sensitive match to the "Customer Name" you extracted.
      2.  **Whole Word Match:** Do not count partial matches (e.g., if the extracted name is "Acme", do not count "AcmeCorp" or "Acme's"). The matched text must stand alone as the full extracted name or be clearly bounded by spaces or punctuation.
      
      **Step 3: Evaluate and Report**
      After performing the count, provide the following specific output:

      1.  **Extracted Customer Name:** [State the customer name you identified in Step 1]
      2.  **Total Occurrences Found:** [State the exact number of times the extracted customer name appears including the customer name mentioned in title, based on your count]
      3.  **Evaluation of Count:**
        * If "Total Occurrences Found" is **exactly 2**, state: "The count is correct."
        * If "Total Occurrences Found" is **more than 2**, state: "The count is incorrect. Total occurrences: [The actual count]."
        * If "Total Occurrences Found" is **less than 2** (0 or 1), state: "The count is incorrect. It is missing from expected locations (e.g., 'Missing in title' or 'Missing in customer table/field')."`
  },
  // Original check for spelling and grammar.
  {
    id: 'check7',
    title: 'Spelling, Grammar, & Formatting',
    prompt: `You are a professional proofreader. Your task is to meticulously scan the entire provided document content for any spelling and grammar errors, adhering strictly to standard English language rules.
      **Instructions for Analysis:**
      1.  **Comprehensive Review:** Examine all text for grammatical correctness (e.g., subject-verb agreement, tense consistency, punctuation, sentence structure) and spelling accuracy.
      2.  **Standard English Rules:** Apply rules of standard written English. Do not flag common colloquialisms or domain-specific terminology as errors unless they are genuinely misspelled or grammatically incorrect.
      3.  **Error Examples:** If errors are found, extract concise examples of the problematic text. Do not rewrite or correct the text, just present the original erroneous snippet.

      **Output Format:**
      * If **ANY** spelling or grammar errors are identified:
          * First, state: "No,"
          * Then, provide a list of specific examples of the errors found. For each example, briefly indicate if it's a spelling or grammar issue.
          Example:
          "No,
          - Spelling error: 'recieve' (should be 'receive')
          - Grammar error: 'The team was go to the meeting.' (should be 'The team was going to the meeting.')
          - Punctuation error: 'It was a cold clear night' (missing comma)"

      * If **NO** spelling or grammar errors are found after a thorough scan:
          * Respond with: "Yes, no errors found in the document."
`,
  },
  // UPDATED check for dates, now explicitly checks for backdating.
  {
    id: 'check8',
    title: 'SOW Start/End Date Check',
    prompt: `You are a document auditor. Your task is to locate and validate the "Start Date" and "End Date" within the provided document content, ensuring specific format and content requirements are met.
      **Step 1: Locate "Start Date" and "End Date"**
      Scan the entire document content to find text explicitly labeled as "Start Date" and "End Date".

      **Step 2: Validate "Start Date" Requirements**
      Once a "Start Date" is identified, check its associated value or description for the following:
      1. It must contain a phrase like "Within 10 business days of signed and executed contract".
      2. It must not be a specific, backdated date (a date in the past). The value should be forward-looking.

      **Step 3: Validate "End Date" Requirements**
      Once an "End Date" is identified, check its value:
      * It must be presented in a valid, recognizable date format (e.g., MM/DD/YYYY, YYYY-MM-DD, or "January 1, 2025").
      * It must be a logical future date that occurs after the implied Start Date.

      **Output Format:**
      * If **BOTH** "Start Date" and "End Date" are found and **BOTH** meet all their respective validation requirements:
          Respond with: "Yes, both Start Date and End Date are correctly formatted."
      * If **either** date fails validation, or if one is missing:
          Respond with: "No, the following date(s) are incorrect:" followed by a specific explanation of the failure (e.g., "Start Date is backdated", "End Date is missing", "Start Date does not contain the required execution phrase").
      * If **NEITHER** "Start Date" nor "End Date" are found:
          Respond with: "No SOW dates found in the document."
`,
  },
  // Original bullet point check.
  {
    id: 'check9',
    title: 'Bullet Points Quality Check',
    prompt:`You are an expert document structure analyst. Your primary task is to identify *only* genuine bullet points in the provided document content and then validate their starting word.
      **Step 1: STRICT Identification of Bullet Points**
      Carefully scan the entire document content to identify text that *unambiguously* represents a bullet point in an unordered or ordered list. Apply these **strict criteria**:

      1.  **Clear List Indicator:** The line *must* begin directly with a common list indicator, such as:
          * A hyphen ('-') followed by a space.
          * An asterisk ('*') followed by a space.
          * A numerical or alphabetical sequence followed by a period and a space (e.g., 1. , 2. , a. , b. ) indicating an ordered list.
          * A common Unicode bullet character (e.g., '•' ) followed by a space.
      2.  **Start of New Line:** The list indicator must be the *very first character* on a new line, with no preceding text or characters on that line.
      3.  **Indentation (Inferential):** Bullet points often appear with consistent indentation relative to surrounding paragraphs. While you cannot "see" exact indentation, infer this characteristic by looking for a pattern of leading spaces before the bullet indicator, suggesting it's part of a list structure rather than continuous prose.
      4.  **Contextual List Structure:** The line should appear within a sequence of similarly formatted lines, forming a clear list, not isolated lines.

      **CRITICAL EXCLUSIONS (Do NOT identify these as bullet points):**
      * **Paragraph Continuations:** Do NOT include lines that might start with a hyphen or number but are clearly continuations of a preceding paragraph or part of run-on text.
      * **Inline Emphasis:** Do NOT include hyphens or asterisks used for inline emphasis *within* a sentence (e.g., "The key point is - clarity").
      * **Table Content:** Do NOT include text within table cells, even if they contain numbers or hyphens.
      * **False Positives:** Ignore lines that coincidentally start with a number or hyphen but are clearly not part of a list (e.g., "The year was 1990. - This is just a sentence.").

      **Step 2: Validate the First Word of Each Identified Bullet Point**
      For each bullet point you *strictly* identified in Step 1, examine its very first word (ignoring leading spaces).

      * **Action Verb Definition:** An "action verb" for this check means a verb that describes an action. This includes base forms (e.g., "Develop", "Implement"), past tense forms (e.g., "Developed", "Implemented"), and present participles (e.g., "Developing", "Implementing").
      * **Case Insensitivity:** Ignore case when checking if it's an action verb (e.g., "Develop" or "develop" are both valid).
      * **EXCLUDE these as Action Verbs:** Do NOT count linking verbs (e.g., "Is", "Are", "Was", "Were", "Be", "Am", "Been"), auxiliary verbs (e.g., "Have", "Has", "Had" when not indicating possession), or any non-verb words (e.g., "The", "A", "And", "With", "For", "To", "Or", "In", "On", "At", "By", "From").

      **Output Format:**

      * If **ALL** strictly identified bullet points begin with a valid action verb as defined:
          Respond with: "Yes, all bullet points use action verbs and are formatted correctly."

      * If **ANY** identified bullet point does NOT begin with a valid action verb:
          Respond with: "No," followed by a list of *each non-compliant bullet point*, presented exactly as it appears in the document content.
`
  },
  // NEW check for placeholder/instructional text.
  {
    id: 'check10',
    title: 'Instructional Text Removal Check',
    prompt: `You are a document finalization expert. Your task is to scan the provided document content for any remaining placeholder or instructional text that should have been removed before finalization.
    
    Search for common instructional phrases, often found in templates, such as:
    - "[Insert..."
    - "TBD"
    - "To be determined"
    - "Note to author"
    - "additional grey text is included"
    - Any text enclosed in square brackets '[]' that appears to be an instruction.

    **Output Format:**
    - If you find any such instructional text, respond with: "No, instructional text found." and list the snippets you identified.
    - If no instructional text is found, respond with: "Yes, all instructional text appears to be removed."
    `
  },
  // NEW check to ensure deliverables do not have specific dates.
  {
    id: 'check11',
    title: 'Deliverable Date Check',
    prompt: `You are a contract analyst. Your task is to verify that individual deliverables listed in the document do NOT have specific delivery dates assigned to them. The SOW should only contain an overall project Start and End Date.

    **Step 1: Identify Deliverables**
    Locate any section, table, or list that itemizes project "Deliverables".
    
    **Step 2: Check for Associated Dates**
    For each identified deliverable, check the surrounding text for any specific dates or deadlines (e.g., "due on MM/DD/YYYY", "by January 1st", "within 3 weeks of kickoff").
    
    **Output Format:**
    - If any deliverable is found to have a specific date associated with it, respond with: "No, specific delivery dates were found on deliverables." and list the deliverable(s) with the associated date.
    - If no specific dates are found tied to individual deliverables, respond with: "Yes, deliverables do not have specific delivery dates."`
  },
  // NEW check for formatting polish. Acknowledges limitations of text-only analysis.
  {
    id: 'check12',
    title: 'Formatting Polish Check',
    prompt: `You are a document formatting analyst. Your task is to check for general formatting consistency. Note: You cannot verify font family or size from raw text, so focus only on structural and emphasis patterns.
    
    **Analysis Points:**
    1.  **Consistent Use of Bold Text:** Is bold text used purposefully for headings and key terms, or does it appear randomly within paragraphs without clear reason?
    2.  **Consistent Bullet Point Structure:** Do all bulleted lists in the document appear to use a consistent style (e.g., all hyphens, or all proper bullet symbols)?

    **Output Format:**
    - If you find significant inconsistencies in the use of bolding or bullet styles, respond with: "No, formatting inconsistencies were found." and provide a brief description of the issues.
    - If the formatting appears generally consistent, respond with: "Yes, formatting appears polished and consistent."`
  },
  // NEW check for date cross-referencing.
  {
    id: 'check13',
    title: 'Date Cross-Reference Check (Section 2)',
    prompt: `You are a document auditor. Your task is to perform a cross-reference check between the main SOW dates and the timeframe described in "Section 2".

    **Step 1:** Locate the primary "Start Date" and "End Date" of the SOW.
    **Step 2:** Locate a section explicitly labeled "Section 2", "Project Timeframe", or similar.
    **Step 3:** Analyze the content of that section to understand the timeframe it describes (e.g., "a 3-month engagement", "work to be completed by Q4").
    **Step 4:** Compare the timeframe from Step 3 with the dates from Step 1 for logical consistency.

    **Output Format:**
    - If the dates are consistent, respond with: "Yes, SOW dates match the Section 2 timeframe."
    - If there is a mismatch or if Section 2 cannot be found, respond with: "No, SOW dates do not match the Section 2 timeframe." and explain the discrepancy (e.g., "SOW End Date is in June, but Section 2 describes a 6-month project starting in January.").
    - If the relevant dates or sections cannot be found to perform the check, state that the check could not be completed.`
  },
  // NEW check for the "[DRAFT]" tag in the title.
  {
    id: 'check14',
    title: 'Draft Status Check in Title',
    prompt: `You are a document controller. Your task is to check if the main document title contains a draft watermark.

    **Step 1:** Identify the main title from the filename or the first prominent line of text in the document content.
    **Step 2:** Check if this identified title begins with the exact, case-sensitive string "[DRAFT]".

    **Output Format:**
    - If the title contains "[DRAFT]" at the beginning, respond with: "Yes, the title includes the [DRAFT] watermark."
    - If the title does not contain the "[DRAFT]" watermark, respond with: "No, the title is missing the [DRAFT] watermark."`
  },
  // NEW check for using the generic "Customer" placeholder, for draft validation.
  {
    id: 'check15',
    title: 'Generic Customer Name Check (For Drafts)',
    prompt: `You are a template compliance checker. Your task is to verify that the document is in a draft state by checking if the generic placeholder "Customer" is used instead of a real customer's name.
    
    **Analysis Steps:**
    1. Scan the main title and key sections (like introductions or tables) for the specific, case-sensitive word "Customer".
    2. The purpose is to ensure a real customer name has *not* yet been entered.

    **Output Format:**
    - If the word "Customer" is consistently used as a placeholder, respond with: "Yes, the generic 'Customer' name is correctly used as a placeholder."
    - If a specific company or individual's name is found where "Customer" should be (especially in the title), respond with: "No, a specific customer name is used instead of the generic 'Customer' placeholder." and mention the name you found.`
  },
  // NEW check for special handling language.
  {
    id: 'check16',
    title: 'Special Handling Language Check',
    prompt: `You are a compliance officer. Your task is to scan the document for any clauses or phrases that indicate special legal, privacy, or regulatory handling requirements.
    
    Look for keywords and phrases related to:
    - Confidentiality (e.g., "Confidential Information", "NDA")
    - Data Privacy (e.g., "GDPR", "CCPA", "PII", "Personally Identifiable Information")
    - Healthcare (e.g., "HIPAA", "PHI", "Protected Health Information")
    - Export Controls (e.g., "Export Administration Regulations", "EAR")
    - Data Residency (e.g., "data must reside in", "data sovereignty")

    **Output Format:**
    - If you find any such language, respond with: "Yes, special handling language was found." and list the keywords or phrases you identified.
    - If no such language is detected, respond with: "No, no special handling language was found."`
  },
];

export function getDefaultChecks(): SowCheck[] {
    if (typeof window === 'undefined') {
        return initialChecks;
    }
    try {
        const storedChecks = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedChecks) {
            return JSON.parse(storedChecks);
        }
    } catch (error) {
        console.error("Failed to parse checks from localStorage", error);
    }
    return initialChecks;
}

export function saveDefaultChecks(checks: SowCheck[]): void {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(checks));
    } catch (error) {
        console.error("Failed to save checks to localStorage", error);
    }
}