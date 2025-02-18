import { XMLParser } from 'fast-xml-parser'

export interface LeetCodeProblem {  
  number: string;  
  title: string;  
  description: string;  
  difficulty: string;  
  tags: string[];  
}

export class AILeetCodeMatcher {
  private problems: LeetCodeProblem[];

  constructor(xmlData: string) {
    this.problems = this.parseXMLData(xmlData);

    if (!this.problems.length) {
      throw new Error("No problems found in the XML data.");
    }
  }

  private parseXMLData(xmlData: string): LeetCodeProblem[] {
    try {
      const parser = new XMLParser({ ignoreAttributes: false, parseAttributeValue: true });
      const parsed = parser.parse(xmlData);
      return parsed.problems.problem || [];
    } catch (error) {
      console.error("Error parsing XML data:", error);
      return [];
    }
  }

  public async findRelevantProblem(query: string): Promise<number> {
    try {
      const response = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, problems: this.problems }),
      });

      const data = await response.json();
      return data.problemNumber || 0;
    } catch (error) {
      console.error("Error finding relevant problem:", error);
      return 0;
    }
  }

  public getProblemDescription(questionId: number): string {
    const problem = this.problems.find(p => parseInt(p.number) === questionId);
    return problem ? `Problem #${problem.number}:
    ${problem.title}\n${problem.description}` : "Problem not found.";
    }
}

