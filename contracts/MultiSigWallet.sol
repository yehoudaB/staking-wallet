// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;


    error TxNotExists(uint transactionIndex);
    error TxAlreadyApproved(uint transaction);
    error TxAlreadySent(uint transactionIndex);

contract MultiSigWallet {
    event DepositEvent(address indexed user, uint amount, uint balance);
    event CreateWithdrawTxEvent(address indexed user, uint indexed txIndex, address indexed to,uint amount);
    event ApproveWithdrawTxEvent(address indexed user , uint txIndex);

    address[] public owners;
    
    struct WithdrawTx {
        address to;
        uint amount;
        uint approvals;
        bool sent;
    }
    WithdrawTx[] withdrawTxs;
    mapping(address => bool) public isOwner;
    uint public quorumRequired;
    mapping(uint => mapping(address => bool)) isApproved;    
   
    constructor(address[] memory _owners, uint _quorumRequired){
        require(_owners.length > 0, "owners required");
        require(_quorumRequired > 0 && _quorumRequired <= _owners.length, "quorum required");
        for(uint i = 0; i < _owners.length; i++){
            require(_owners[i] != address(0), "invalid owner");
            require(!isOwner[_owners[i]], "owner not unique");
            isOwner[_owners[i]] = true;
        }
        owners = _owners;
        quorumRequired = _quorumRequired;
    }

    function getOwners() public view returns(address[] memory){
        return owners;
    }
 
    function createWithdraw(address _to, uint _amount )  public _onlyOwner(){
        withdrawTxs.push(WithdrawTx({
            to: _to,
            amount: _amount,
            approvals : 0,
            sent:  false
        }));
        emit CreateWithdrawTxEvent(msg.sender, withdrawTxs.length, _to , _amount);
        
    }
    function approveWithdrawTx(uint _txIndex) public 
     _onlyOwner() _transactionExists(_txIndex) _transactionNotApproved(_txIndex) _transactionNotSent(_txIndex){
        withdrawTxs[_txIndex].approvals  +=1;
        isApproved[_txIndex][msg.sender] =  true;
        if(withdrawTxs[_txIndex].approvals >= quorumRequired){
            withdrawTxs[_txIndex].sent = true;
            (bool success, ) =  withdrawTxs[_txIndex].to.call{value : withdrawTxs[_txIndex].amount}('');
             require(success, "transaction failed");
             emit ApproveWithdrawTxEvent(msg.sender, _txIndex);
        }
    }

    function getWithdrawTxCount() public view returns(uint) {
        return  withdrawTxs.length;
        
    }
    function getWithdrawTxes() public view returns(WithdrawTx[] memory){
        return withdrawTxs;
    }
    function getWithdrawTx(uint _txIndex) public view returns(WithdrawTx memory){
        return withdrawTxs[_txIndex];
    }

    function balanceOf() public view returns(uint){
        return address(this).balance;
    }
    

   function deposit() public payable {
        emit DepositEvent(msg.sender, msg.value, address(this).balance );
   }
  
    

    modifier _onlyOwner() {
        require(isOwner[msg.sender], "not owner");
        _;
    }

    modifier _transactionExists(uint _transactionIndex) {
        require(_transactionIndex < withdrawTxs.length, "Tx not exists");
        _;
    }
    modifier _transactionNotApproved(uint _transactionIndex) {
        require(!isApproved[_transactionIndex][msg.sender], "Tx already approved");
        _;
    }
    modifier _transactionNotSent(uint _transactionIndex) {
        require(!withdrawTxs[_transactionIndex].sent, 'Tx already sent');
        _;
    }

   
   

}