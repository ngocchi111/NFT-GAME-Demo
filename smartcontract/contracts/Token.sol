pragma solidity ^0.8.1;

import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../node_modules/@openzeppelin/contracts/utils/Strings.sol";

contract Token is ERC721 {
    using Strings for uint256;

    // string public domain = "localhost:8080";

    mapping(uint256 => address) internal cardToOwner;
    mapping(uint256 => uint256) internal cardToPrice;
    mapping(address => uint256) internal ownerCardCount;
    uint256 nextId = 1;
    uint16 internal constant CARD_PER_COLLECTION = 5;
    address _admin;

    constructor() ERC721("The bai", "The") {}

    function setAdmin() public payable {
        // require(
        //     msg.value == 50 ether,
        //     "you must deposit 50 eth to become admin"
        // );
        _admin = msg.sender;
    }

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getWalletBalance() public view returns (uint256) {
        return address(msg.sender).balance;
    }

    function mint() public {
        require(msg.sender == _admin, "only admin have the permission to mint");
        _safeMint(msg.sender, nextId);

        cardToOwner[nextId] = msg.sender;
        ownerCardCount[msg.sender] = ownerCardCount[msg.sender] + 1;
        nextId++;
    }

    function getAllCardIds() public view returns (uint256[] memory) {
        if (nextId <= 1) {
            return new uint256[](0);
        }

        uint256[] memory ids = new uint256[](nextId - 1);
        uint256 i = 0;
        while (i < nextId - 1) {
            ids[i] = i + 1;
            i = i + 1;
        }

        return ids;
    }

    function getOwnCardIds(address _owner)
        public
        view
        returns (uint256[] memory)
    {
        uint256 ownerCount = ownerCardCount[_owner];
        if (ownerCount == 0) {
            return new uint256[](0);
        }

        uint256[] memory ids = new uint256[](ownerCount);
        uint256 i = 1;
        uint256 count = 0;
        while (count < ownerCount || i < nextId) {
            if (cardToOwner[i] == _owner) {
                ids[count] = i;
                count++;
            }
            i++;
        }

        return ids;
    }

    function getOwnCollection(address _owner)
        public
        view
        returns (uint256[] memory)
    {
        uint256 ownerCount = ownerCardCount[_owner];
        if (ownerCount == 0) {
            return new uint256[](0);
        }

        uint256[] memory myCards = getOwnCardIds(_owner);

        if (ownerCount <= CARD_PER_COLLECTION) {
            return myCards;
        }

        uint256 cardsLength = myCards.length;
        while (cardsLength > CARD_PER_COLLECTION) {
            uint256 removeIndex = block.timestamp % cardsLength;

            for (uint256 i = removeIndex; i < cardsLength - 1; i++) {
                myCards[i] = myCards[i + 1];
            }
            delete myCards[cardsLength - 1];
            cardsLength--;
        }

        uint256[] memory ids = new uint256[](CARD_PER_COLLECTION);
        for (uint256 i = 0; i < CARD_PER_COLLECTION; i++) {
            ids[i] = myCards[i];
        }

        return ids;
    }

    function setPrice(uint256 _tokenId, uint256 price)
        public
        returns (uint256)
    {
        require(msg.sender == _admin, "you must admin to set token price");

        cardToPrice[_tokenId] = price;

        return cardToPrice[_tokenId];
    }

    function getTokenPrice(uint256 _tokenId) public view returns (uint256) {
        return cardToPrice[_tokenId];
    }

    function buyCard(uint256 _tokenId) external payable {
        uint256 price = cardToPrice[_tokenId];

        string memory s1 = string.concat(
            " payment must be exact ",
            Strings.toString(msg.value)
        );
        string memory s2 = string.concat(Strings.toString(price), s1);
        require(msg.value == price, s2);

        address owner = cardToOwner[_tokenId];

        require(msg.sender != owner, "you cannot buy your own token ");

        doTransfer(owner, msg.sender, _tokenId);
    }

    function takePromotionalCard() external payable returns (uint256) {
        require(msg.value == 0, "you must not send eth to contract");

        uint256 _tokenId = 0;
        for (uint256 i = 1; i < nextId; i++) {
            if (cardToOwner[i] == _admin) {
                _tokenId = i;
                break;
            }
        }

        require(
            _tokenId != 0,
            "Not found any available card for promotional purpose."
        );

        address owner = cardToOwner[_tokenId];

        require(msg.sender != owner, "you cannot receive your own token ");

        doTransfer(owner, msg.sender, _tokenId);

        return _tokenId;
    }

    function getContractEthBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function sellCard(uint256 _tokenId) external payable {
        address owner = cardToOwner[_tokenId];
        require(
            owner == msg.sender,
            "only card owner have permission to sell card"
        );

        require(msg.sender != _admin, "admin do not sell card");

        uint256 sellPrice = cardToPrice[_tokenId] / 2;
        doTransfer(owner, _admin, _tokenId);

        payable(owner).transfer(sellPrice);
    }

    function doTransfer(
        address owner,
        address to,
        uint256 _tokenId
    ) private {
        _transfer(owner, to, _tokenId);

        cardToOwner[_tokenId] = to;
        ownerCardCount[to] = ownerCardCount[to] + 1;
        if (ownerCardCount[owner] > 0) {
            ownerCardCount[owner] = ownerCardCount[owner] - 1;
        }
    }

    function getPrices() public view returns (uint256[] memory) {
        uint256[] memory prices = new uint256[](nextId - 1);

        for (uint256 i = 1; i < nextId; i++) {
            prices[i - 1] = cardToPrice[i];
        }

        return prices;
    }
}
