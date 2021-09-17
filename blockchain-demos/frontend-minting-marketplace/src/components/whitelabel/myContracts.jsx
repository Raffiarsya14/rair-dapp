import {useState, useEffect, useCallback} from 'react'

import DeployContracts from './DeployContracts.jsx';
import CreateProduct from './CreateProduct.jsx';

import BinanceDiamond from '../../images/binance-diamond.svg'
import MaticLogo from '../../images/polygon-matic.svg'
import EthereumLogo from '../../images/ethereum-logo.svg'

const chainData = {
	'BNB': {image: BinanceDiamond, name: 'Binance'},
	'tMATIC': {image: MaticLogo, name: 'Matic'},
	'ETH': {image: EthereumLogo, name: 'Ethereum'}
}

const Factory = () => {

	const [contractArray, setContractArray] = useState([]);
	

	const fetchContracts = useCallback(async () => {
		let response = await (await fetch('/api/contracts', {
			headers: {
				'x-rair-token': localStorage.token
			}
		})).json();
		if (response.success) {
			let contractData = [];
			for await (let contract of response.contracts) {
				let response2 = await (await fetch(`/api/contracts/${contract.contractAddress}`, {
					headers: {
						'x-rair-token': localStorage.token
					}
				})).json();
				let response3 = await (await fetch(`/api/contracts/${contract.contractAddress}/products/offers`, {
					headers: {
						'x-rair-token': localStorage.token
					}
				})).json();
				if (response3.success) {
					response2.contract.products = response3.products
				}
				contractData.push(response2.contract)
			} 
			setContractArray(contractData);
		}
	}, [])

	useEffect(() => {
		fetchContracts()
	}, [fetchContracts])

	console.log(contractArray);

	return <div style={{position: 'relative'}} className='w-100 text-start row mx-0 px-0'>
		<h1>Your deployed contracts</h1>
		<DeployContracts />
		{contractArray && contractArray.map((item, index) => {
			console.log(item);
			return <div className='col-4 p-2' key={index}>
				<div style={{
					border: 'solid 1px black',
					borderRadius: '16px',
					position: 'relative',
					background: `url(${chainData[item.blockchain]?.image})`,
					backgroundRepeat: 'no-repeat',
					backgroundSize: '5rem 5rem',
					backgroundPosition: 'top right',
					backgroundColor: '#FFFA',
					backgroundBlendMode: 'lighten'
				}} className='w-100 p-3'>
					<small>({item.contractAddress})</small>
					<h5>{item.title}</h5>
					{item.products.length} products! <CreateProduct address={item.contractAddress} />
					<hr />
					<div className='w-100 row px-0 mx-0'>
						{item.products
							.sort((a,b) => a.creationDate > b.creationDate ? 1 : -1)
							.map((product, index) => {
								return <div key={index} style={{position: 'relative'}} className='col-12 text-center'>
									<div style={{position: 'absolute', top: 0, left: 0}}>
										{product.firstTokenIndex}...
									</div>
									{product.name}<br />
									<div style={{position: 'absolute', top: 0, right: 0}}>
										...{product.firstTokenIndex + product.copies - 1}
									</div>
									<progress
										className='w-100'
										max={product.firstTokenIndex + product.copies}
										value={product.soldCopies}
									/>
									<details className='w-100 text-start row px-0 mx-0'>
										<summary>
											{product.offers.length} offers
										</summary>
										{product.offers
											.sort((a,b) => a.creationDate > b.creationDate ? 1 : -1)
											.map((offer, index) => {
											return <div key={index} style={{position: 'relative'}} className='col-12 text-center'>
												<div style={{position: 'absolute', top: 0, left: '1rem'}}>
													{offer.range[0]}...
												</div>
												{offer.offerName}<br />
												<div style={{position: 'absolute', top: 0, right: '1rem'}}>
													...{offer.range[1]}
												</div>
												<progress
													className='w-100'
													min={offer.range[0]}
													max={offer.range[1]}
													value={offer.soldCopies}
												/>
											</div>
										})}
										<hr />
									</details>
								</div>
						})}
					</div>
				</div>
			</div>
		})}
	</div>
};

export default Factory;