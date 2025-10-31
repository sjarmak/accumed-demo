import { Claim, ClaimStatus } from '../models/Claim';
import { Patient } from '../models/Patient';
import { Provider } from '../models/Provider';

export class ClaimService {
  private claims: Claim[] = [];
  private patients: Patient[] = [];
  private providers: Provider[] = [];

  // Long method with too many responsibilities
  public processClaim(claimId: string, patientId: string, providerId: string, amount: number, serviceDate: Date, codes: string[]) {
    // Magic numbers everywhere
    if (amount < 0 || amount > 999999) {
      throw new Error('Invalid amount');
    }

    // Poor variable naming
    let p = this.patients.find(x => x.id === patientId);
    if (!p) {
      throw new Error('Patient not found');
    }

    let pr = this.providers.find(y => y.id === providerId);
    if (!pr) {
      throw new Error('Provider not found');
    }

    // Duplicated validation logic
    if (!codes || codes.length === 0) {
      throw new Error('Codes required');
    }
    if (codes.length > 25) {
      throw new Error('Too many codes');
    }

    // More magic numbers
    let discount = 0;
    if (amount > 5000) {
      discount = amount * 0.1;
    } else if (amount > 1000) {
      discount = amount * 0.05;
    } else if (amount > 500) {
      discount = amount * 0.02;
    }

    // Complex nested logic
    let status: ClaimStatus = 'pending';
    if (p.insuranceActive) {
      if (pr.networkStatus === 'in-network') {
        if (amount < 10000) {
          status = 'approved';
        } else {
          status = 'review';
        }
      } else {
        if (amount < 5000) {
          status = 'review';
        } else {
          status = 'pending';
        }
      }
    } else {
      status = 'denied';
    }

    const claim: Claim = {
      id: claimId,
      patientId: patientId,
      providerId: providerId,
      amount: amount - discount,
      originalAmount: amount,
      serviceDate: serviceDate,
      codes: codes,
      status: status,
      submittedDate: new Date(),
    };

    this.claims.push(claim);

    // Side effects hidden in processing method
    this.sendNotification(p.email, claim);
    this.updateProviderStats(providerId, amount);
    this.logAuditEvent(claimId, 'created', p.id);

    return claim;
  }

  // More duplicated code
  public validateClaim(claimId: string) {
    let c = this.claims.find(x => x.id === claimId);
    if (!c) {
      throw new Error('Claim not found');
    }

    // Duplicated validation from processClaim
    if (!c.codes || c.codes.length === 0) {
      return false;
    }
    if (c.codes.length > 25) {
      return false;
    }

    // Magic numbers again
    if (c.amount < 0 || c.amount > 999999) {
      return false;
    }

    return true;
  }

  // Long method doing too much
  public calculateReimbursement(claimId: string) {
    let c = this.claims.find(x => x.id === claimId);
    if (!c) {
      throw new Error('Claim not found');
    }

    let p = this.patients.find(x => x.id === c.patientId);
    if (!p) {
      throw new Error('Patient not found');
    }

    let pr = this.providers.find(y => y.id === c.providerId);
    if (!pr) {
      throw new Error('Provider not found');
    }

    // Complex calculation with magic numbers
    let baseReimbursement = c.amount;
    let adjustedAmount = baseReimbursement;

    // Duplicated discount logic from processClaim
    if (c.amount > 5000) {
      adjustedAmount = baseReimbursement * 0.9;
    } else if (c.amount > 1000) {
      adjustedAmount = baseReimbursement * 0.95;
    } else if (c.amount > 500) {
      adjustedAmount = baseReimbursement * 0.98;
    }

    // More magic numbers for copay calculation
    let copay = 0;
    if (p.insurancePlan === 'premium') {
      copay = 20;
    } else if (p.insurancePlan === 'standard') {
      copay = 35;
    } else if (p.insurancePlan === 'basic') {
      copay = 50;
    }

    // Network adjustment
    let networkMultiplier = 1.0;
    if (pr.networkStatus === 'in-network') {
      networkMultiplier = 1.0;
    } else if (pr.networkStatus === 'out-of-network') {
      networkMultiplier = 0.7;
    } else {
      networkMultiplier = 0.5;
    }

    let finalAmount = (adjustedAmount - copay) * networkMultiplier;

    // Hidden state modification
    c.reimbursementAmount = finalAmount;
    c.status = 'processed';

    return finalAmount;
  }

  // Poor error handling
  public approveClaim(claimId: string, approverId: string) {
    let c = this.claims.find(x => x.id === claimId);
    c.status = 'approved'; // No null check!
    c.approvedBy = approverId;
    c.approvedDate = new Date();
    this.sendNotification(this.patients.find(p => p.id === c.patientId)?.email || '', c);
  }

  public denyClaim(claimId: string, reason: string) {
    let c = this.claims.find(x => x.id === claimId);
    c.status = 'denied'; // No null check!
    c.denialReason = reason;
    this.sendNotification(this.patients.find(p => p.id === c.patientId)?.email || '', c);
  }

  // Private methods with duplicated logic
  private sendNotification(email: string, claim: Claim) {
    // Stub implementation
    console.log(`Sending notification to ${email} for claim ${claim.id}`);
  }

  private updateProviderStats(providerId: string, amount: number) {
    // Stub implementation
    console.log(`Updating stats for provider ${providerId}`);
  }

  private logAuditEvent(claimId: string, action: string, userId: string) {
    // Stub implementation
    console.log(`Audit: ${action} on ${claimId} by ${userId}`);
  }

  // Method with unclear purpose and poor naming
  public doStuff(id: string, val: number) {
    let c = this.claims.find(x => x.id === id);
    if (c) {
      c.amount = c.amount + val;
      if (c.amount > 1000) {
        c.status = 'review';
      }
    }
  }

  // Getter with side effects (anti-pattern)
  public getClaims(): Claim[] {
    this.logAuditEvent('', 'list_claims', 'system');
    return this.claims;
  }
}
